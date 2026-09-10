-- ROOTS & Co : mise a jour ciblee, le stock suit les commandes.
-- A coller si vous avez DEJA lance supabase-setup.sql une fois.
-- Ne touche a aucun produit, aucun prix, aucune donnee existante.
-- SQL Editor, New query, coller, Run.

create or replace function public.stock_sur_commande()
returns trigger language plpgsql security definer set search_path = public as $$
declare it jsonb;
begin
  for it in select * from jsonb_array_elements(coalesce(new.items, '[]'::jsonb)) loop
    update public.products
       set stock = stock - coalesce((it->>'qty')::int, 0), maj_le = now()
     where ref = it->>'ref';
  end loop;
  return new;
end $$;

create or replace function public.stock_sur_annulation()
returns trigger language plpgsql security definer set search_path = public as $$
declare it jsonb; sens int;
begin
  if new.status = old.status then return new; end if;
  if new.status = 'annule' and old.status <> 'annule' then sens := 1;
  elsif old.status = 'annule' and new.status <> 'annule' then sens := -1;
  else return new; end if;
  for it in select * from jsonb_array_elements(coalesce(new.items, '[]'::jsonb)) loop
    update public.products
       set stock = stock + sens * coalesce((it->>'qty')::int, 0), maj_le = now()
     where ref = it->>'ref';
  end loop;
  return new;
end $$;

drop trigger if exists trg_stock_sur_commande on public.orders;
create trigger trg_stock_sur_commande after insert on public.orders
  for each row execute function public.stock_sur_commande();

drop trigger if exists trg_stock_sur_annulation on public.orders;
create trigger trg_stock_sur_annulation after update of status on public.orders
  for each row execute function public.stock_sur_annulation();
