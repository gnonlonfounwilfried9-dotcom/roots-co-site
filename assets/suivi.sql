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
