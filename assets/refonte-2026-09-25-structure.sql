-- ROOTS & Co : refonte du 2026-09-25 (retour "Elements de correction site e-commerce 20260924")
-- Bloc 1 sur 2 : compte obligatoire, rattachement des anciennes commandes, devis par e-mail,
-- notification e-mail de chaque commande et de chaque devis. Idempotent, relancable sans risque.
-- A coller dans Supabase > SQL Editor > New query > Run.

create extension if not exists pg_net;

-- 1. Compte obligatoire : plus aucune commande sans compte connecte ------------------------
drop policy if exists "Le site peut enregistrer une commande" on public.orders;
drop policy if exists "Un client connecte peut enregistrer sa commande" on public.orders;
create policy "Un client connecte peut enregistrer sa commande"
  on public.orders for insert
  to authenticated
  with check (user_id = auth.uid());

-- 2. Les commandes passees sans compte, avec la meme adresse e-mail CONFIRMEE, sont
--    rattachees au compte a sa premiere connexion (appel automatique depuis compte.html)
create or replace function public.rattacher_mes_commandes()
returns integer language plpgsql security definer set search_path = public as $$
declare e text; n integer;
begin
  if auth.uid() is null then return 0; end if;
  select email into e from auth.users where id = auth.uid() and email_confirmed_at is not null;
  if e is null then return 0; end if;
  update public.orders set user_id = auth.uid()
   where user_id is null and lower(customer_mail) = lower(e);
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.rattacher_mes_commandes() from public, anon;
grant execute on function public.rattacher_mes_commandes() to authenticated;

-- 3. Demandes de devis (formulaire de la page Contact) -------------------------------------
create table if not exists public.devis (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  ref text,
  nom text not null,
  email text not null,
  tel text,
  societe text,
  besoin text not null,
  page text,
  statut text not null default 'nouveau'
);
alter table public.devis enable row level security;
drop policy if exists "Le site enregistre une demande de devis" on public.devis;
drop policy if exists "L'administrateur consulte les devis" on public.devis;
drop policy if exists "L'administrateur traite les devis" on public.devis;
drop policy if exists "L'administrateur supprime un devis" on public.devis;
create policy "Le site enregistre une demande de devis"
  on public.devis for insert to anon, authenticated
  with check (statut = 'nouveau'
    and length(nom) between 1 and 150
    and email like '%_@_%._%' and length(email) <= 200
    and length(besoin) between 5 and 5000);
create policy "L'administrateur consulte les devis"
  on public.devis for select to authenticated
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()));
create policy "L'administrateur traite les devis"
  on public.devis for update to authenticated
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from public.admins where admins.user_id = auth.uid()));
create policy "L'administrateur supprime un devis"
  on public.devis for delete to authenticated
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()));

-- 4. Notification e-mail a chaque nouvelle commande et chaque nouveau devis ---------------
-- Table privee (aucune regle d'acces : invisible depuis le site) qui garde l'adresse de la
-- fonction d'envoi et le secret partage avec elle.
create table if not exists public.interne_config (cle text primary key, valeur text not null);
alter table public.interne_config enable row level security;
insert into public.interne_config (cle, valeur) values
  ('notif_url', 'https://uqhrlgrryjlqoqpkrixv.supabase.co/functions/v1/notifier-admin'),
  ('notif_secret', 'SECRET_A_COLLER_ICI')  -- valeur transmise hors du depot public, identique au secret NOTIF_SECRET de la fonction
on conflict (cle) do update set valeur = excluded.valeur;

create or replace function public.notifier_admin()
returns trigger language plpgsql security definer set search_path = public as $$
declare u text; s text;
begin
  select valeur into u from public.interne_config where cle = 'notif_url';
  select valeur into s from public.interne_config where cle = 'notif_secret';
  if u is not null and s is not null then
    perform net.http_post(
      url := u,
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-roots-secret', s),
      body := jsonb_build_object('type', tg_argv[0], 'record', to_jsonb(new))
    );
  end if;
  return new;
exception when others then
  return new;  -- une panne d'envoi ne doit jamais bloquer une commande
end $$;

drop trigger if exists notifier_commande on public.orders;
create trigger notifier_commande after insert on public.orders
  for each row execute function public.notifier_admin('commande');
drop trigger if exists notifier_devis on public.devis;
create trigger notifier_devis after insert on public.devis
  for each row execute function public.notifier_admin('devis');

-- Verification :
-- select policyname, cmd, roles from pg_policies where tablename in ('orders','devis');
-- select * from net._http_response order by created desc limit 5;
