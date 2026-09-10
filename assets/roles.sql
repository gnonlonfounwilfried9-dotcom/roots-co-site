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
