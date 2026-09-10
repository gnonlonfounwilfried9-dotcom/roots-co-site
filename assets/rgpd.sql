-- ROOTS & Co : RGPD, suppression des donnees a la demande du client.
-- Relancable sans risque. SQL Editor, New query, coller, Run.

-- Le client peut, depuis son espace, effacer toutes ses commandes et son compte.
create or replace function public.supprimer_mon_compte()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Aucun compte connecte';
  end if;
  -- on garde une trace comptable anonyme : la commande reste, sans donnees personnelles
  update public.orders
     set customer_name = 'Client supprime', customer_org = null, customer_tel = 'supprime',
         customer_mail = 'supprime', customer_city = 'supprime', ship_address = null,
         ship_slot = null, pay_detail = null, note = null, user_id = null
   where user_id = uid;
  delete from auth.users where id = uid;
end $$;

revoke all on function public.supprimer_mon_compte() from public, anon;
grant execute on function public.supprimer_mon_compte() to authenticated;
