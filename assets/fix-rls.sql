-- ROOTS & Co : correctif solide des regles de securite liees aux roles.
-- Les verifications "est-ce un admin / un membre de l'equipe" passent desormais
-- par des fonctions dediees (security definer), qui ne sont jamais bloquees par
-- les regles de la table admins/staff elle-meme (piege classique de RLS imbriquee).
-- C'est le modele recommande par Supabase pour ce genre de verification.
-- Relancable sans risque. SQL Editor, New query, coller, Run.

create or replace function public.est_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
create or replace function public.est_equipe()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;
revoke all on function public.est_admin() from public, anon;
grant execute on function public.est_admin() to authenticated;
revoke all on function public.est_equipe() from public, anon;
grant execute on function public.est_equipe() to authenticated;

drop policy if exists "Chacun voit ses commandes, l'administrateur les voit toutes" on public.orders;
create policy "Chacun voit ses commandes, l'administrateur les voit toutes" on public.orders for select to authenticated using (user_id = auth.uid() or public.est_admin());
drop policy if exists "L'administrateur met a jour le statut" on public.orders;
create policy "L'administrateur met a jour le statut" on public.orders for update to authenticated using (public.est_admin()) with check (public.est_admin());
drop policy if exists "L'administrateur supprime une commande" on public.orders;
create policy "L'administrateur supprime une commande" on public.orders for delete to authenticated using (public.est_admin());
drop policy if exists "L'administrateur gere les categories" on public.categories;
create policy "L'administrateur gere les categories" on public.categories for all to authenticated using (public.est_admin()) with check (public.est_admin());
drop policy if exists "L'administrateur gere le catalogue" on public.products;
create policy "L'administrateur gere le catalogue" on public.products for all to authenticated using (public.est_admin()) with check (public.est_admin());
drop policy if exists "L'equipe se voit" on public.staff;
create policy "L'equipe se voit" on public.staff for select to authenticated using (public.est_equipe());
drop policy if exists "L'administrateur gere l'equipe" on public.staff;
create policy "L'administrateur gere l'equipe" on public.staff for all to authenticated using (public.est_admin()) with check (public.est_admin());
drop policy if exists "L'equipe lit le journal" on public.audit_log;
create policy "L'equipe lit le journal" on public.audit_log for select to authenticated using (public.est_equipe());
drop policy if exists "L'equipe ecrit dans le journal" on public.audit_log;
create policy "L'equipe ecrit dans le journal" on public.audit_log for insert to authenticated with check (public.est_equipe());
drop policy if exists "L'administrateur gere les reglages" on public.parametres;
create policy "L'administrateur gere les reglages" on public.parametres for all to authenticated using (public.est_admin()) with check (public.est_admin());
drop policy if exists "L'administrateur gere les zones" on public.zones_livraison;
create policy "L'administrateur gere les zones" on public.zones_livraison for all to authenticated using (public.est_admin()) with check (public.est_admin());
