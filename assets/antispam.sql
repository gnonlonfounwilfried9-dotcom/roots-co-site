-- ROOTS & Co : durcissement anti-spam du formulaire de devis (table public.devis).
-- A coller dans Supabase, SQL Editor, puis Run. Idempotent, relancable sans risque.
-- Ajoute : colonne ip, limites de debit par adresse e-mail et par adresse IP, refus des messages
-- qui contiennent plusieurs liens. Le site (assets/app.js) applique deja les memes regles cote navigateur ;
-- ce script les impose aussi cote serveur, ce qui arrete les robots qui appellent directement l'API.

alter table public.devis add column if not exists ip text;

create or replace function public.devis_antispam() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  hdr json;
  adr text;
  n int;
  liens int;
begin
  begin
    hdr := current_setting('request.headers', true)::json;
  exception when others then
    hdr := null;
  end;
  adr := nullif(split_part(coalesce(hdr ->> 'x-forwarded-for', ''), ',', 1), '');
  new.ip := adr;

  -- 1. pas plus de 3 demandes par heure avec la meme adresse e-mail
  select count(*) into n from public.devis
   where lower(email) = lower(new.email) and created_at > now() - interval '1 hour';
  if n >= 3 then
    raise exception 'Trop de demandes recentes. Reessayez plus tard.' using errcode = 'P0001';
  end if;

  -- 2. pas plus de 5 demandes par heure depuis la meme adresse IP
  if adr is not null then
    select count(*) into n from public.devis
     where ip = adr and created_at > now() - interval '1 hour';
    if n >= 5 then
      raise exception 'Trop de demandes recentes. Reessayez plus tard.' using errcode = 'P0001';
    end if;
  end if;

  -- 3. un message avec plus de 2 liens est presque toujours du spam
  select count(*) into liens from regexp_matches(coalesce(new.besoin, ''), 'https?://|www\.', 'gi');
  if liens > 2 then
    raise exception 'Message refuse.' using errcode = 'P0001';
  end if;

  -- 4. limites de taille supplementaires
  if length(coalesce(new.societe, '')) > 200 or length(coalesce(new.tel, '')) > 40 then
    raise exception 'Message refuse.' using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists devis_antispam on public.devis;
create trigger devis_antispam before insert on public.devis
  for each row execute function public.devis_antispam();

-- Verification : insert ... x4 avec le meme e-mail dans l'heure doit echouer a la quatrieme.
-- Pour consulter les adresses IP des demandes suspectes :
--   select created_at, email, ip, left(besoin, 80) from public.devis order by created_at desc limit 50;
