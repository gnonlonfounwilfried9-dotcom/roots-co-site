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
