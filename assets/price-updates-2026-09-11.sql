-- ROOTS & Co : mise a jour tarifaire Dell (Excel du 2026-09-11) + renommage de la reference
-- vers le numero d'identification officiel (RTS_...), demande le 2026-09-14.
-- Coller UNE SEULE FOIS dans Supabase > SQL Editor > New query > Run. Les WHERE ciblent
-- l'ancienne reference (encore en base), le SET pose la nouvelle reference et le nouveau prix.
update public.products set ref='RTS_2026360025', prix_ht_fcfa=748252, prix_ttc_fcfa=882937, maj_le=now() where ref='DC16250';
update public.products set ref='RTS_2026360026', prix_ht_fcfa=723493, prix_ttc_fcfa=853722, maj_le=now() where ref='DP14-120U';
update public.products set ref='RTS_2026360027', prix_ht_fcfa=549355, prix_ttc_fcfa=648239, maj_le=now() where ref='DP14E-i3U';
update public.products set ref='RTS_2026360028', prix_ht_fcfa=624457, prix_ttc_fcfa=736859, maj_le=now() where ref='DP14E-i3W';
update public.products set ref='RTS_2026360029', prix_ht_fcfa=706987, prix_ttc_fcfa=834245, maj_le=now() where ref='DP14E-i5U';
