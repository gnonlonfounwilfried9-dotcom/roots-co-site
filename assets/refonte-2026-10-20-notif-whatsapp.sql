-- ROOTS & Co : alerte e-mail aussi pour les commandes WhatsApp, et resynchronisation du secret
-- de notification. A coller dans Supabase > SQL Editor > New query > Run. Idempotent.
-- Avant de lancer : remplacer NOTIF_SECRET_A_COLLER_ICI ci-dessous par la valeur donnee par
-- Claude dans le chat (jamais stockee ici, dans un depot public).

-- 1. Nouvelle table : une ligne a chaque clic "commander sur WhatsApp" (assets/shop.js, notifyWA)
create table if not exists public.intentions_whatsapp (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  produit_nom text not null,
  produit_ref text,
  prix_ht_fcfa numeric,
  page text
);
alter table public.intentions_whatsapp enable row level security;
drop policy if exists "Le site enregistre une intention WhatsApp" on public.intentions_whatsapp;
create policy "Le site enregistre une intention WhatsApp"
  on public.intentions_whatsapp for insert to anon, authenticated
  with check (length(produit_nom) between 1 and 300);
drop policy if exists "L'administrateur consulte les intentions WhatsApp" on public.intentions_whatsapp;
create policy "L'administrateur consulte les intentions WhatsApp"
  on public.intentions_whatsapp for select to authenticated
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()));

-- 2. Meme declencheur que les commandes et les devis (fonction deja creee le 2026-09-25)
drop trigger if exists notifier_whatsapp on public.intentions_whatsapp;
create trigger notifier_whatsapp after insert on public.intentions_whatsapp
  for each row execute function public.notifier_admin('whatsapp');

-- 3. Resynchronise le secret partage avec la fonction Edge notifier-admin (la ligne existante
--    pouvait encore contenir le texte "SECRET_A_COLLER_ICI"). A reporter AUSSI dans
--    Supabase > Edge Functions > notifier-admin > Secrets > NOTIF_SECRET (remplace l'ancienne
--    valeur si elle existe deja : les deux valeurs doivent etre identiques).
insert into public.interne_config (cle, valeur) values
  ('notif_secret', 'NOTIF_SECRET_A_COLLER_ICI')
on conflict (cle) do update set valeur = excluded.valeur;

-- 4. Nettoie la ligne de test inseree pendant la verification du 2026-10-20 (a ignorer si deja supprimee)
delete from public.devis where ref = 'DV-TEST-1223';

-- Verification apres coup, a lancer separement si besoin :
-- select * from net._http_response order by created desc limit 5;
