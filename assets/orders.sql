-- ROOTS : table des commandes de la boutique + regles d'acces.
-- A coller dans Supabase, Project -> SQL Editor -> New query -> Run.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'nouveau',
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

alter table public.orders enable row level security;

-- le site public (visiteurs, cle anon) peut seulement CREER une commande,
-- jamais lire, modifier ou supprimer celles des autres
create policy "Le site peut enregistrer une commande"
  on public.orders for insert
  to anon
  with check (true);

-- seule une personne connectee (l'administrateur) peut consulter les commandes
create policy "L'administrateur peut consulter les commandes"
  on public.orders for select
  to authenticated
  using (true);

-- et changer leur statut (nouveau, confirme, en livraison, livre, annule)
create policy "L'administrateur peut mettre a jour le statut"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);

-- Ensuite, dans Supabase : Authentication -> Users -> Add user, avec l'e-mail
-- et le mot de passe que l'administrateur utilisera pour se connecter au
-- tableau de bord (assets/../admin.html). Un seul compte suffit.
