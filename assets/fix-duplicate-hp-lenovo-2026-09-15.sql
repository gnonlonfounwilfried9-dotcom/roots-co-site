-- ROOTS & Co : nettoyage des 22 doublons HP/Lenovo (44 sur le site vs 66 dans Supabase).
-- Cause : catalog-hp-lenovo.sql a ete colle une 1ere fois le 2026-09-11 avec les anciennes
-- references courtes (AD0W1ET, B39X6AT, etc.), puis une 2e fois le 2026-09-14 avec les
-- nouvelles references RTS_2026360XXX. Comme "on conflict (ref)" ne matche que si le ref est
-- identique, la 2e execution a AJOUTE 22 nouvelles lignes au lieu de mettre a jour les 22
-- anciennes, qui sont restees en base, orphelines (plus utilisees par le site).
-- Etape 1 : verifier avant de supprimer (doit renvoyer exactement 22 lignes, les anciennes
-- fiches HP/Lenovo, avec les anciens prix/noms).
select ref, nom_fr, spec_fr, prix_ht_fcfa
from public.products
where ref in (
  'AD0W1ET','AD0W9ET','AD2G9ET','AD2H0ET','B39X6AT','B70WXAT','B70X0AT',
  'C65S4ET','CA6U4AT','CA6U8AT','967U5ET','B39P8AT','83GW0076FE','83SC007WFE',
  '83K000FMFE','82XQ01NTFE','82XQ01NUFE','83GU00ARFE','83GW00EPFE','83GW006MFE',
  '83V4003PFE','HP290G9BDL'
)
order by ref;

-- Etape 2 : si l'etape 1 confirme bien les 22 anciennes fiches (et seulement elles), supprimer.
-- Garde-fou : ne supprime que si les 22 fiches de remplacement (references RTS) existent deja.
delete from public.products
where ref in (
  'AD0W1ET','AD0W9ET','AD2G9ET','AD2H0ET','B39X6AT','B70WXAT','B70X0AT',
  'C65S4ET','CA6U4AT','CA6U8AT','967U5ET','B39P8AT','83GW0076FE','83SC007WFE',
  '83K000FMFE','82XQ01NTFE','82XQ01NUFE','83GU00ARFE','83GW00EPFE','83GW006MFE',
  '83V4003PFE','HP290G9BDL'
)
and exists (
  select 1 from public.products p2
  where p2.ref in (
    'RTS_2026360035','RTS_2026360036','RTS_2026360037','RTS_2026360038','RTS_2026360039',
    'RTS_2026360040','RTS_2026360041','RTS_2026360042','RTS_2026360043','RTS_2026360044',
    'RTS_2026360045','RTS_2026360046','RTS_2026360047','RTS_2026360048','RTS_2026360049',
    'RTS_2026360050','RTS_2026360051','RTS_2026360052','RTS_2026360053','RTS_2026360055',
    'RTS_2026360056','RTS_2026360057'
  )
);

-- Etape 3 : verification finale, doit renvoyer 44.
select count(*) as total_produits from public.products;
