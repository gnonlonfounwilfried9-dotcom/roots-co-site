-- ROOTS & Co : correction des quantites en stock et des noms, 2026-09-21.
-- Source : ROOTS Promo Dell SEPTEMBRE 2026C.xlsx, colonne QTE, lignes du meme article additionnees.
-- Remplace les quantites du fichier photos-officielles-2026-09-20.sql qui ne comptaient qu'une seule ligne.
-- Idempotent, relancable. A coller dans Supabase > SQL Editor > Run.

update public.products p set stock = v.q from (values
  ('353176-7010/UK', 50),
  ('676239-7020', 40),
  ('373664-S2425HSM', 90),
  ('267525-P2425H', 22),
  ('693453-MFS22/1', 60),
  ('492483-MS116', 295),
  ('529980-MS116', 535),
  ('024026-MS5120W', 11),
  ('921181-KM5221W', 5),
  ('913572-ADAPTER/UK', 204),
  ('403753-KIT/1', 30),
  ('437255-R760', 13),
  ('054400-T550', 2)
) as v(ref, q) where p.ref = v.ref;

update public.products p set nom_fr = v.nom from (values
  ('919730-MC16255', 'Dell Pro Max 16 (AMD Ryzen AI 9)'),
  ('419933-P2219H', 'Dell Professional P2225H')
) as v(ref, nom) where p.ref = v.ref;
