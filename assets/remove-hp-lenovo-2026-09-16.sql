-- ROOTS & Co : retrait complet des 22 produits HP et Lenovo (decision reunion du 2026-09-16,
-- "on enleve les 22 premiers articles, on garde uniquement les nouveaux mis en avant").
-- Supprime a la fois les 22 fiches sous references RTS (catalog-hp-lenovo.sql) ET les 22
-- anciennes fiches orphelines sous references courtes (doublons diagnostiques le 2026-09-15,
-- voir assets/fix-duplicate-hp-lenovo-2026-09-15.sql) : les deux versions disparaissent, plus
-- besoin de lancer separement le correctif de doublon.
-- Etape 1 : verification avant suppression (doit renvoyer 44 lignes : 22 RTS + 22 anciennes).
select ref, nom_fr, spec_fr
from public.products
where ref in (
  'RTS_2026360035','RTS_2026360036','RTS_2026360037','RTS_2026360038','RTS_2026360039',
  'RTS_2026360040','RTS_2026360041','RTS_2026360042','RTS_2026360043','RTS_2026360044',
  'RTS_2026360045','RTS_2026360046','RTS_2026360047','RTS_2026360048','RTS_2026360049',
  'RTS_2026360050','RTS_2026360051','RTS_2026360052','RTS_2026360053','RTS_2026360055',
  'RTS_2026360056','RTS_2026360057',
  'AD0W1ET','AD0W9ET','AD2G9ET','AD2H0ET','B39X6AT','B70WXAT','B70X0AT',
  'C65S4ET','CA6U4AT','CA6U8AT','967U5ET','B39P8AT','83GW0076FE','83SC007WFE',
  '83K000FMFE','82XQ01NTFE','82XQ01NUFE','83GU00ARFE','83GW00EPFE','83GW006MFE',
  '83V4003PFE','HP290G9BDL'
)
order by ref;

-- Etape 2 : suppression.
delete from public.products
where ref in (
  'RTS_2026360035','RTS_2026360036','RTS_2026360037','RTS_2026360038','RTS_2026360039',
  'RTS_2026360040','RTS_2026360041','RTS_2026360042','RTS_2026360043','RTS_2026360044',
  'RTS_2026360045','RTS_2026360046','RTS_2026360047','RTS_2026360048','RTS_2026360049',
  'RTS_2026360050','RTS_2026360051','RTS_2026360052','RTS_2026360053','RTS_2026360055',
  'RTS_2026360056','RTS_2026360057',
  'AD0W1ET','AD0W9ET','AD2G9ET','AD2H0ET','B39X6AT','B70WXAT','B70X0AT',
  'C65S4ET','CA6U4AT','CA6U8AT','967U5ET','B39P8AT','83GW0076FE','83SC007WFE',
  '83K000FMFE','82XQ01NTFE','82XQ01NUFE','83GU00ARFE','83GW00EPFE','83GW006MFE',
  '83V4003PFE','HP290G9BDL'
);

-- Etape 3 : verification finale, doit renvoyer 22 (les 22 Dell d'origine).
select count(*) as total_produits from public.products;
