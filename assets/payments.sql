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
