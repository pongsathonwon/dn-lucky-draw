create table public.customers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  spin_count  integer not null default 0,
  is_winner   boolean not null default false,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.customers enable row level security;

create policy "Public can read customers"
  on public.customers for select
  using (true);

create policy "Authenticated users can insert customers"
  on public.customers for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update customers"
  on public.customers for update
  to authenticated
  using (true);

create policy "Authenticated users can delete customers"
  on public.customers for delete
  to authenticated
  using (true);
