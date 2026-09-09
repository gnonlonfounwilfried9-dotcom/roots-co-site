-- ROOTS : table des commandes de la boutique, espace client et tableau de bord admin.
-- A coller dans Supabase, Project -> SQL Editor -> New query -> Run (une seule fois).

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

-- la liste des comptes administrateurs (juste leur identifiant, rien d'autre) :
-- un compte y figure = il voit et gere TOUTES les commandes, comme dans le tableau de bord
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id)
);

alter table public.orders enable row level security;
alter table public.admins enable row level security;

-- le site public (visiteur non connecte, cle anon) peut seulement CREER une commande
create policy "Le site peut enregistrer une commande"
  on public.orders for insert
  to anon
  with check (true);

-- un client connecte peut aussi creer une commande, rattachee a son compte
create policy "Un client connecte peut enregistrer sa commande"
  on public.orders for insert
  to authenticated
  with check (user_id = auth.uid());

-- un client connecte voit UNIQUEMENT ses propres commandes ; un administrateur les voit toutes
create policy "Chacun voit ses commandes, l'administrateur les voit toutes"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid() or exists (select 1 from public.admins where admins.user_id = auth.uid()));

-- seul un administrateur peut changer le statut d'une commande
create policy "L'administrateur met a jour le statut"
  on public.orders for update
  to authenticated
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from public.admins where admins.user_id = auth.uid()));

-- personne ne lit la liste des administrateurs depuis le site (verifiee uniquement via les policies ci-dessus)
create policy "Personne ne consulte la table admins directement"
  on public.admins for select
  to authenticated
  using (false);

-- ------------------------------------------------------------------
-- Ensuite, dans Supabase :
-- 1) Authentication -> Users -> Add user : creez le compte administrateur
--    (l'e-mail et le mot de passe que VOUS utiliserez pour le tableau de bord).
-- 2) Copiez son "User UID" affiche dans la liste des utilisateurs.
-- 3) Revenez dans SQL Editor et executez, en remplacant l'UID :
--      insert into public.admins (user_id) values ('COLLEZ_L_UID_ICI');
-- Les clients, eux, creent leur compte tout seuls depuis compte.html sur le site
-- (ils n'ont jamais besoin d'etre ajoutes ici, ils ne verront que leurs commandes).
