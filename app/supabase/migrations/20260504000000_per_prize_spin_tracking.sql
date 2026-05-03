-- Track spins per (customer, prize) pair
create table public.customer_prize_spins (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  prize_id    uuid not null references public.prizes(id) on delete cascade,
  spin_count  integer not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (customer_id, prize_id)
);

alter table public.customer_prize_spins enable row level security;

create policy "anon can read customer_prize_spins"
  on public.customer_prize_spins for select
  to anon using (true);

create policy "auth can all on customer_prize_spins"
  on public.customer_prize_spins for all
  to authenticated using (true) with check (true);

-- Add prize context to spin audit log
alter table public.spin_results
  add column prize_id uuid references public.prizes(id) on delete set null;

-- Remove prize-agnostic spin counter from customers
alter table public.customers drop column spin_count;

-- Atomic upsert: inserts on first spin, increments on subsequent spins
-- Returns the new spin_count value
create or replace function public.increment_prize_spin(
  p_customer_id uuid,
  p_prize_id    uuid
) returns integer
language plpgsql
security definer
as $$
declare
  v_count integer;
begin
  insert into public.customer_prize_spins (customer_id, prize_id, spin_count, updated_at)
  values (p_customer_id, p_prize_id, 1, now())
  on conflict (customer_id, prize_id)
  do update set
    spin_count = customer_prize_spins.spin_count + 1,
    updated_at = now()
  returning spin_count into v_count;

  return v_count;
end;
$$;
