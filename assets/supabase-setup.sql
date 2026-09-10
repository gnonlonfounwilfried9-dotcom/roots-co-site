-- ROOTS & Co : installation complete de la base.
-- A COLLER EN UNE SEULE FOIS dans Supabase : menu de gauche, SQL Editor, New query, Run.
-- Relancable sans risque. ATTENTION : la partie 2 recharge les 22 produits d'origine.
-- Pour une mise a jour ciblee, lancez plutot les fichiers assets/*.sql separement.

-- ========== 1. COMMANDES, ESPACE CLIENT, TABLEAU DE BORD ==========

-- ROOTS : table des commandes de la boutique, espace client et tableau de bord admin.
-- A coller dans Supabase, Project -> SQL Editor -> New query -> Run (une seule fois).
-- Ce script peut etre relance sans risque si besoin (il remplace proprement les regles
-- existantes au lieu d'echouer si elles sont deja la).

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'nouveau',
  user_id uuid references auth.users(id),
  customer_name text not null,
  customer_org text,
  customer_tel text not null,
  customer_mail text not null,
  customer_city text not null,
  ship_method text not null,
  ship_address text,
  ship_slot text,
  pay_method text not null,
  pay_detail text,
  items jsonb not null,
  total_fcfa integer not null,
  total_eur numeric not null,
  note text
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id)
);

alter table public.orders add column if not exists ref text;

alter table public.orders enable row level security;
alter table public.admins enable row level security;

drop policy if exists "Le site peut enregistrer une commande" on public.orders;
drop policy if exists "Un client connecte peut enregistrer sa commande" on public.orders;
drop policy if exists "Chacun voit ses commandes, l'administrateur les voit toutes" on public.orders;
drop policy if exists "L'administrateur met a jour le statut" on public.orders;
drop policy if exists "L'administrateur supprime une commande" on public.orders;
drop policy if exists "Personne ne consulte la table admins directement" on public.admins;

create policy "Le site peut enregistrer une commande"
  on public.orders for insert
  to anon
  with check (true);

create policy "Un client connecte peut enregistrer sa commande"
  on public.orders for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Chacun voit ses commandes, l'administrateur les voit toutes"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid() or exists (select 1 from public.admins where admins.user_id = auth.uid()));

create policy "L'administrateur met a jour le statut"
  on public.orders for update
  to authenticated
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from public.admins where admins.user_id = auth.uid()));

create policy "L'administrateur supprime une commande"
  on public.orders for delete
  to authenticated
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()));

create policy "Personne ne consulte la table admins directement"
  on public.admins for select
  to authenticated
  using (false);


-- ========== 2. CATALOGUE, STOCK ET DECLENCHEURS ==========

-- Roots & Co : catalogue produits. A coller dans Supabase SQL Editor, relancable sans risque.

create table if not exists public.categories (
  id text primary key,
  nom_fr text not null,
  nom_en text,
  parent_id text references public.categories(id),
  rang int default 0
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null,
  nom_fr text not null,
  nom_en text,
  categorie_id text references public.categories(id),
  spec_fr text,
  desc_fr text,
  desc_en text,
  prix_ttc_fcfa integer not null,
  prix_ht_fcfa integer,
  tva numeric not null default 0.18,
  stock integer not null default 0,
  seuil_alerte integer not null default 3,
  images jsonb not null default '[]'::jsonb,
  actif boolean not null default true,
  cree_le timestamptz not null default now(),
  maj_le timestamptz not null default now()
);

alter table public.categories enable row level security;
alter table public.products enable row level security;

drop policy if exists "Catalogue visible par tous" on public.products;
drop policy if exists "Categories visibles par tous" on public.categories;
drop policy if exists "L'administrateur gere le catalogue" on public.products;
drop policy if exists "L'administrateur gere les categories" on public.categories;

create policy "Categories visibles par tous" on public.categories for select to anon, authenticated using (true);
create policy "Catalogue visible par tous" on public.products for select to anon, authenticated using (true);
create policy "L'administrateur gere les categories" on public.categories for all to authenticated
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from public.admins where admins.user_id = auth.uid()));
create policy "L'administrateur gere le catalogue" on public.products for all to authenticated
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from public.admins where admins.user_id = auth.uid()));

-- ---- le stock suit les commandes : chaque commande deduit, chaque annulation remet ----
create or replace function public.stock_sur_commande()
returns trigger language plpgsql security definer set search_path = public as $$
declare it jsonb;
begin
  for it in select * from jsonb_array_elements(coalesce(new.items, '[]'::jsonb)) loop
    update public.products
       set stock = stock - coalesce((it->>'qty')::int, 0), maj_le = now()
     where ref = it->>'ref';
  end loop;
  return new;
end $$;

create or replace function public.stock_sur_annulation()
returns trigger language plpgsql security definer set search_path = public as $$
declare it jsonb; sens int;
begin
  if new.status = old.status then return new; end if;
  if new.status = 'annule' and old.status <> 'annule' then sens := 1;
  elsif old.status = 'annule' and new.status <> 'annule' then sens := -1;
  else return new; end if;
  for it in select * from jsonb_array_elements(coalesce(new.items, '[]'::jsonb)) loop
    update public.products
       set stock = stock + sens * coalesce((it->>'qty')::int, 0), maj_le = now()
     where ref = it->>'ref';
  end loop;
  return new;
end $$;

drop trigger if exists trg_stock_sur_commande on public.orders;
create trigger trg_stock_sur_commande after insert on public.orders
  for each row execute function public.stock_sur_commande();

drop trigger if exists trg_stock_sur_annulation on public.orders;
create trigger trg_stock_sur_annulation after update of status on public.orders
  for each row execute function public.stock_sur_annulation();

insert into public.categories (id, nom_fr, nom_en, rang) values
  ('portables','Ordinateurs portables','Laptops',1),
  ('bureau','Ordinateurs de bureau','Desktops',2),
  ('ecrans','Écrans','Monitors',3),
  ('stations','Stations d''accueil','Docking stations',4),
  ('accessoires','Claviers et souris','Keyboards and mice',5),
  ('divers','Divers','Other',9)
on conflict (id) do update set nom_fr=excluded.nom_fr, nom_en=excluded.nom_en, rang=excluded.rang;

insert into public.products (ref, nom_fr, categorie_id, spec_fr, desc_fr, prix_ttc_fcfa, prix_ht_fcfa, stock, images) values
  ('DC16250','Dell 16','portables','16 pouces, Core i5-120U 10 coeurs, 16 Go, 512 Go SSD, Windows 11 Pro, garantie 1 an','Le portable qui remplace celui qui rame. Le Dell 16 arrive neuf et scellé, seize pouces, seize gigaoctets de mémoire, processeur Core i5 dix coeurs et Windows 11 Pro déjà installé. De quoi ouvrir dix onglets, un tableau et une visioconférence sans ralentir, un seul paiement, pas un abonnement caché. Garantie constructeur un an, livraison au Togo et au Bénin.',695695,589572,10,'["assets/produits/DC16250.png"]'::jsonb),
  ('DP14-120U','Dell Pro 14','portables','14 pouces, Core i5-120U 10 coeurs, 8 Go, 512 Go SSD, Ubuntu, garantie 3 ans','Trois ans de garantie, un seul prix affiché. Le Dell Pro 14 tourne sous Ubuntu, quatorze pouces, processeur Core i5 dix coeurs et 512 gigaoctets de stockage. Pensé pour un usage professionnel stable, sans les logiciels superflus qui ralentissent une machine neuve. La garantie de trois ans, la plus longue de notre catalogue portable, en dit long sur sa robustesse. Matériel neuf et scellé.',670854,568520,10,'["assets/produits/DP14-120U.png"]'::jsonb),
  ('DP14E-i3U','Dell Pro 14 Essential','portables','14 pouces, Core i3-100U 6 coeurs, 8 Go, 512 Go SSD, Ubuntu, garantie 2 ans','Le poste d''entrée qui ne fait pas semblant. Pour une première équipe ou un budget serré, le Dell Pro 14 Essential en configuration Core i3 fait le travail sans détour. Huit gigaoctets de mémoire, 512 gigaoctets de stockage, Ubuntu installé, garantie deux ans. Neuf et scellé, pas un reconditionné maquillé en neuf.',496100,420424,10,'["assets/produits/DP14E-i3U.png"]'::jsonb),
  ('DP14E-i3W','Dell Pro 14 Essential','portables','14 pouces, Core i3-100U 6 coeurs, 8 Go, 512 Go SSD, Windows 11 Pro, garantie 2 ans','Le premier ordinateur d''une activité qui démarre. On démarre une activité, le budget est serré, et la tentation de la machine la moins chère du marché est grande. Six mois plus tard, elle est à la poubelle. Le Dell Pro 14 Essential existe pour éviter ça, Windows 11 Pro installé, garantie deux ans. Neuf et scellé.',571463,484291,10,'["assets/produits/DP14E-i3W.png"]'::jsonb),
  ('DP14E-i5U','Dell Pro 14 Essential','portables','14 pouces, Core i5-220U 10 coeurs, 16 Go, 512 Go SSD, Ubuntu, garantie 1 an','Le double de mémoire, pour le même format. Même carrosserie que l''Essential i3, mais un processeur Core i5 dix coeurs et seize gigaoctets de mémoire qui changent tout dès que plusieurs logiciels tournent ensemble. Ubuntu installé, 512 gigaoctets de stockage, garantie un an.',654284,554478,10,'["assets/produits/DP14E-i5U.png"]'::jsonb),
  ('DP14E-i5W','Dell Pro 14 Essential','portables','14 pouces, Core i5-220U 10 coeurs, 16 Go, 512 Go SSD, Windows 11 Pro, garantie 1 an','Le poste qu''on recommande le plus aux chefs d''équipe. Seize gigaoctets de mémoire, processeur Core i5 dix coeurs, Windows 11 Pro déjà activé. C''est la configuration que nous conseillons le plus souvent à un responsable ou un chef d''équipe qui jongle entre tableurs, messagerie et visioconférence. Livraison au Togo et au Bénin.',732966,621158,10,'["assets/produits/DP14E-i5W.png"]'::jsonb),
  ('DP15E','Dell Pro 15 Essential','portables','15,6 pouces, Core i5-1334U 10 coeurs, 16 Go, 512 Go SSD, Ubuntu, garantie 1 an','Un plus grand écran, pour le même effort financier. Quinze pouces six, processeur Core i5 de treizième génération, seize gigaoctets de mémoire et Ubuntu installé. Le Dell Pro 15 Essential convient à qui préfère travailler sur un écran plus large sans changer de budget.',600450,508856,10,'["assets/produits/DP15E.png"]'::jsonb),
  ('QCS1250N','Dell Pro Slim','bureau','Format compact, Ultra 5-235 14 coeurs, 16 Go, 512 Go SSD, Ubuntu, garantie 1 an','La puissance d''une tour, la place d''un livre. Format compact pensé pour les bureaux où l''espace manque, le Dell Pro Slim embarque un processeur Ultra 5 quatorze coeurs et seize gigaoctets de mémoire. Il tient debout dans un tiroir de bureau et libère la place sous l''écran. Ubuntu installé.',661743,560799,10,'["assets/produits/QCS1250N.png"]'::jsonb),
  ('TOWER-W11','Dell Pro Tower','bureau','Format tour, 14 coeurs cadencés à 5,0 GHz, 8 Go, 512 Go SSD, Windows 11 Pro, garantie 1 an','Un poste fixe qui ne cède jamais sous la charge. Format tour classique, processeur quatorze coeurs cadencé à cinq gigahertz, Windows 11 Pro installé. C''est le poste fixe que nous posons dans les bureaux qui gardent plusieurs logiciels ouverts toute la journée. Extensible sans tout remplacer.',661743,560799,10,'["assets/produits/TOWER-W11.png"]'::jsonb),
  ('QC1250N','Dell Pro Tower QC1250-N','bureau','Format tour, Core i3-14100 4 coeurs, 8 Go, 512 Go SSD, Ubuntu, garantie 1 an','Le poste fixe le plus accessible du catalogue. Processeur Core i3 quatorzième génération, huit gigaoctets de mémoire, 512 gigaoctets de stockage, Ubuntu installé. Le Dell Pro Tower QC1250-N équipe la comptabilité, la caisse ou l''accueil sans faire exploser le budget.',521774,442181,10,'["assets/produits/QC1250N.png"]'::jsonb),
  ('TOWER-i5','Dell Pro Tower i5-14500','bureau','Format tour, Core i5-14500 14 coeurs, 8 Go, 512 Go SSD, Ubuntu, garantie 1 an','Le poste qui tient la comptabilité et l''ERP en même temps. Vous équipez un cabinet comptable, une agence ou un cybercafé. Le Dell Pro Tower i5-14500 tient la comptabilité, l''ERP et plusieurs fenêtres ouvertes sans ralentir, quatorze coeurs, huit gigaoctets de mémoire, Ubuntu installé. Le prix baisse à partir de plusieurs postes achetés ensemble.',578921,490611,10,'["assets/produits/TOWER-i5.png"]'::jsonb),
  ('QBT1250N','Dell Pro Plus Tower','bureau','Format tour, Ultra 5-235 14 coeurs, 8 Go, 512 Go SSD, Ubuntu, garantie 1 an','Un poste pensé pour durer, pas pour dépanner. Un poste destiné à rester cinq ans en service se choisit différemment d''un poste qu''on remplace tous les deux ans. Le Dell Pro Plus Tower embarque un processeur Ultra 5 de dernière génération et s''étend sans rien remplacer. Ubuntu installé.',612874,519385,10,'["assets/produits/QBT1250N.png"]'::jsonb),
  ('E2425HSM','Dell Pro 24','ecrans','24 pouces, HDMI et VGA, pied ajustable, ComfortView, garantie 3 ans','L''écran le plus accessible qui ne sacrifie rien au confort. Vingt-quatre pouces, entrées HDMI et VGA pour brancher un parc plus ancien, pied ajustable, technologie ComfortView contre la fatigue oculaire. Le Dell Pro 24 reste l''écran le plus accessible du catalogue, garanti trois ans.',95245,80716,10,'["assets/produits/E2425HSM.png"]'::jsonb),
  ('S2425HSM','Dell 24 Plus','ecrans','24 pouces, Full HD, haut-parleurs intégrés, garantie 3 ans','Une enceinte de moins à brancher, un bureau de plus dégagé. Full HD, haut-parleurs déjà intégrés, garantie trois ans. Le Dell 24 Plus convient aussi bien à la bureautique qu''aux visioconférences quotidiennes, sans câble supplémentaire à faire courir sur le bureau.',99384,84224,10,'["assets/produits/S2425HSM.png"]'::jsonb),
  ('S2725HSM','Dell 27 Plus','ecrans','27 pouces, Full HD, haut-parleurs intégrés, garantie 3 ans','Cinq mille francs d''écart, et pourtant tout change. Entre un vingt-quatre et un vingt-sept pouces, l''écart de prix est faible et le confort de travail ne l''est pas. Le Dell 27 Plus change la façon de travailler sur un tableau ou une comptabilité, deux fenêtres côte à côte sans plisser les yeux.',124232,105281,10,'["assets/produits/S2725HSM.png"]'::jsonb),
  ('MS116','Souris filaire Dell MS116','accessoires','Filaire USB-A, optique 1000 dpi, 3 boutons et molette, garantie 1 an','Le remplacement qu''on garde toujours sous la main. Une souris qui lâche un vendredi soir, ça arrive à tout le monde. La MS116 filaire, optique 1000 dpi, trois boutons et molette, est le remplacement standard que nous recommandons. Livrée avec toutes nos commandes d''ordinateurs si vous le demandez.',7452,6315,10,'["assets/produits/MS116.png"]'::jsonb),
  ('KM5221W','Clavier et souris Dell Pro KM5221W','accessoires','Sans fil, AZERTY français, noir, garantie 3 ans','Sans fil, sans compromis, garanti trois ans. Clavier et souris sans fil, disposition AZERTY français, finition noire. Le pack KM5221W dégage le bureau des câbles tout en gardant la fiabilité d''un matériel d''origine.',24021,20357,10,'["assets/produits/KM5221W.png"]'::jsonb),
  ('KM7120W','Clavier et souris Dell Pro Plus KM7120W','accessoires','Sans fil compact, QWERTY UK, multi-appareils, garantie 3 ans','Un pack qui bascule d''un appareil à l''autre. Format compact, connexion sans fil multi-appareils, le KM7120W permet de passer du poste fixe au portable sans redébrancher quoi que ce soit. Disposition QWERTY UK.',48036,40708,10,'["assets/produits/KM7120W.png"]'::jsonb),
  ('KB216','Clavier filaire Dell KB216','accessoires','Filaire USB-A, AZERTY français, noir, garantie 1 an','Rien à charger, rien à appairer, on branche et ça marche. Clavier filaire, disposition AZERTY français, finition noire. C''est le genre d''accessoire qu''on n''achète qu''une fois par poste, autant qu''il soit d''origine.',9938,8422,10,'["assets/produits/KB216.png"]'::jsonb),
  ('WD25','Station d''accueil Dell Pro WD25','stations','USB-C, charge le portable, USB-A / USB-C / HDMI, Ethernet RJ45, garantie 1 an','Un câble, et le portable devient un poste fixe. USB-C, recharge le portable, sort l''image sur un grand écran, connecte le réseau filaire en une seule connexion. La station WD25 se branche le matin et se débranche le soir, rien à reconfigurer.',128371,108789,10,'["assets/produits/WD25.png"]'::jsonb),
  ('WD25-3Y','Station d''accueil Dell Pro WD25','stations','USB-C, charge le portable, USB-A / USB-C / HDMI, Ethernet RJ45, garantie 3 ans','La même station, avec deux ans de garantie en plus. Strictement la même station d''accueil USB-C que la WD25 standard, avec une garantie étendue à trois ans pour un écart de prix minime. Un calcul simple pour un poste qui reste branché toute la journée.',133343,113003,10,'["assets/produits/WD25-3Y.png"]'::jsonb),
  ('WD25TB4','Station d''accueil Dell Pro Thunderbolt 4','stations','Thunderbolt 4, charge haute puissance, TB4 / USB-A / HDMI / DP, Ethernet RJ45, garantie 1 an','Ce n''est ni la machine ni les écrans, c''est le câble. Vous avez investi dans une machine puissante et deux grands écrans, et l''image saccade dès que vous déplacez une fenêtre. La station Thunderbolt 4 fait sauter cette limite d''un seul câble, charge haute puissance, ports TB4, USB-A, HDMI et DisplayPort réunis.',198768,168447,10,'["assets/produits/WD25TB4.png"]'::jsonb)
on conflict (ref) do update set
  nom_fr=excluded.nom_fr, categorie_id=excluded.categorie_id, spec_fr=excluded.spec_fr,
  desc_fr=excluded.desc_fr, prix_ttc_fcfa=excluded.prix_ttc_fcfa, prix_ht_fcfa=excluded.prix_ht_fcfa,
  images=excluded.images, maj_le=now();



-- ========== 3. SUIVI DES VISITES ET DE L'ASSISTANT ==========

-- ROOTS & Co : suivi des visites et de l'assistant, pour le tableau de bord analytique.
-- Relancable sans risque. SQL Editor, New query, coller, Run.

create table if not exists public.visites (
  id bigint generated always as identity primary key,
  quand timestamptz not null default now(),
  page text,
  referent text
);

create table if not exists public.chat_logs (
  id bigint generated always as identity primary key,
  quand timestamptz not null default now(),
  question text,
  page text
);

alter table public.visites enable row level security;
alter table public.chat_logs enable row level security;

drop policy if exists "Le site enregistre une visite" on public.visites;
drop policy if exists "L'administrateur lit les visites" on public.visites;
drop policy if exists "Le site enregistre une question" on public.chat_logs;
drop policy if exists "L'administrateur lit les questions" on public.chat_logs;

create policy "Le site enregistre une visite" on public.visites
  for insert to anon, authenticated with check (true);
create policy "L'administrateur lit les visites" on public.visites
  for select to authenticated
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()));

create policy "Le site enregistre une question" on public.chat_logs
  for insert to anon, authenticated with check (true);
create policy "L'administrateur lit les questions" on public.chat_logs
  for select to authenticated
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()));



-- ========== 4. EQUIPE, ROLES ET JOURNAL DES ACTIONS ==========

-- ROOTS & Co : equipe interne, roles et journal des actions.
-- Relancable sans risque. SQL Editor, New query, coller, Run.

create table if not exists public.staff (
  user_id uuid primary key references auth.users(id),
  nom text,
  role text not null default 'support' check (role in ('admin', 'manager', 'support')),
  cree_le timestamptz not null default now()
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  quand timestamptz not null default now(),
  user_id uuid,
  user_nom text,
  action text not null,
  cible text,
  details jsonb
);

-- reprendre les administrateurs deja declares
insert into public.staff (user_id, role, nom)
  select a.user_id, 'admin', coalesce(u.email, 'Administrateur')
  from public.admins a left join auth.users u on u.id = a.user_id
on conflict (user_id) do nothing;

-- admins reste synchronise sur staff (role admin), pour ne casser aucune regle existante
create or replace function public.sync_admins()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'DELETE' then
    delete from public.admins where user_id = old.user_id;
    return old;
  end if;
  if new.role = 'admin' then
    insert into public.admins (user_id) values (new.user_id) on conflict (user_id) do nothing;
  else
    delete from public.admins where user_id = new.user_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_sync_admins on public.staff;
create trigger trg_sync_admins after insert or update or delete on public.staff
  for each row execute function public.sync_admins();

alter table public.staff enable row level security;
alter table public.audit_log enable row level security;

drop policy if exists "L'equipe se voit" on public.staff;
drop policy if exists "L'administrateur gere l'equipe" on public.staff;
drop policy if exists "L'equipe lit le journal" on public.audit_log;
drop policy if exists "L'equipe ecrit dans le journal" on public.audit_log;

create policy "L'equipe se voit" on public.staff for select to authenticated
  using (exists (select 1 from public.staff s where s.user_id = auth.uid()));
create policy "L'administrateur gere l'equipe" on public.staff for all to authenticated
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from public.admins where admins.user_id = auth.uid()));

create policy "L'equipe lit le journal" on public.audit_log for select to authenticated
  using (exists (select 1 from public.staff s where s.user_id = auth.uid()));
create policy "L'equipe ecrit dans le journal" on public.audit_log for insert to authenticated
  with check (exists (select 1 from public.staff s where s.user_id = auth.uid()));

-- Double authentification : a activer dans Supabase, Authentication -> Sign In / Providers,
-- section Multi-Factor Authentication, cocher TOTP. Le bouton "Securiser mon compte" du
-- tableau de bord prend le relais pour l'enrolement.



-- ========== 5. REGLAGES, LIVRAISON, TVA ET DEVISES ==========

-- ROOTS & Co : reglages, zones de livraison, TVA et devises.
-- Relancable sans risque. SQL Editor, New query, coller, Run.

create table if not exists public.parametres (
  cle text primary key,
  valeur text not null,
  maj_le timestamptz not null default now()
);

create table if not exists public.zones_livraison (
  id bigint generated always as identity primary key,
  nom text not null,
  pays text,
  tarif_fcfa integer not null default 0,
  delai text,
  rang int not null default 0,
  actif boolean not null default true
);

alter table public.parametres enable row level security;
alter table public.zones_livraison enable row level security;

drop policy if exists "Reglages visibles" on public.parametres;
drop policy if exists "L'administrateur gere les reglages" on public.parametres;
drop policy if exists "Zones visibles" on public.zones_livraison;
drop policy if exists "L'administrateur gere les zones" on public.zones_livraison;

create policy "Reglages visibles" on public.parametres for select to anon, authenticated using (true);
create policy "L'administrateur gere les reglages" on public.parametres for all to authenticated
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from public.admins where admins.user_id = auth.uid()));

create policy "Zones visibles" on public.zones_livraison for select to anon, authenticated using (true);
create policy "L'administrateur gere les zones" on public.zones_livraison for all to authenticated
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from public.admins where admins.user_id = auth.uid()));

insert into public.parametres (cle, valeur) values
  ('tva', '0.18'),
  ('taux_eur_fcfa', '655.957'),
  ('taux_usd_fcfa', '600')
on conflict (cle) do nothing;

insert into public.zones_livraison (nom, pays, tarif_fcfa, delai, rang) values
  ('Retrait a Lome', 'Togo', 0, 'Immediat', 1),
  ('Retrait a Cotonou', 'Benin', 0, 'Immediat', 2),
  ('Livraison Grand Lome', 'Togo', 3000, '24 a 48 h', 3),
  ('Livraison Grand Cotonou', 'Benin', 3000, '24 a 48 h', 4),
  ('Livraison sous-region', 'CEDEAO', 0, 'Sur devis', 5),
  ('Livraison France', 'France', 0, 'Sur devis', 6)
on conflict do nothing;



-- ========== 6. RGPD, SUPPRESSION DES DONNEES ==========

-- ROOTS & Co : RGPD, suppression des donnees a la demande du client.
-- Relancable sans risque. SQL Editor, New query, coller, Run.

-- Le client peut, depuis son espace, effacer toutes ses commandes et son compte.
create or replace function public.supprimer_mon_compte()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Aucun compte connecte';
  end if;
  -- on garde une trace comptable anonyme : la commande reste, sans donnees personnelles
  update public.orders
     set customer_name = 'Client supprime', customer_org = null, customer_tel = 'supprime',
         customer_mail = 'supprime', customer_city = 'supprime', ship_address = null,
         ship_slot = null, pay_detail = null, note = null, user_id = null
   where user_id = uid;
  delete from auth.users where id = uid;
end $$;

revoke all on function public.supprimer_mon_compte() from public, anon;
grant execute on function public.supprimer_mon_compte() to authenticated;



-- ========== 7. PAIEMENT EN LIGNE, COLONNES DE SUIVI ==========

-- ROOTS & Co : paiement en ligne, colonnes de suivi sur les commandes.
-- Relancable sans risque. SQL Editor, New query, coller, Run.

alter table public.orders add column if not exists paye boolean not null default false;
alter table public.orders add column if not exists paiement_ref text;
alter table public.orders add column if not exists paiement_operateur text;
alter table public.orders add column if not exists paye_le timestamptz;

-- Le webhook du prestataire de paiement (fonction Edge, service_role) met a jour
-- paye, paiement_ref, paiement_operateur et passe le statut a "confirme".
-- Aucun acces public a ces colonnes en ecriture : seul le service_role, via la
-- fonction Edge, peut confirmer un paiement. Les regles RLS existantes suffisent
-- (anon insert only, service_role bypass RLS).



-- ========== 8. SUIVI DE COLIS ==========

-- ROOTS & Co : suivi de colis. Le client voit ou en est sa commande, l'administrateur
-- ajoute chaque etape. Relancable sans risque. SQL Editor, New query, coller, Run.

alter table public.orders add column if not exists suivi jsonb not null default '[]'::jsonb;
alter table public.orders add column if not exists livraison_estimee date;

-- Chaque etape ajoutee au suivi est aussi tracee dans le journal (via l'app).
-- Le client lit "suivi" et "livraison_estimee" sur ses propres commandes (regle SELECT
-- existante). Seul l'administrateur les met a jour (regle UPDATE existante).

-- Premiere etape automatique a la creation de la commande.
create or replace function public.suivi_initial()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.suivi := jsonb_build_array(jsonb_build_object(
    'etape', 'Commande recue',
    'date', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SSOF'),
    'note', 'Nous avons bien recu votre commande.'
  ));
  return new;
end $$;

drop trigger if exists trg_suivi_initial on public.orders;
create trigger trg_suivi_initial before insert on public.orders
  for each row execute function public.suivi_initial();

