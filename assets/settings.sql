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
