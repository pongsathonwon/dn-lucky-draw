create table public.spin_results (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  outcome     text not null check (outcome in ('win', 'no_win')),
  created_at  timestamptz not null default now()
);

alter table public.spin_results enable row level security;

create policy "Public can read spin results"
  on public.spin_results for select
  using (true);

-- SpinPage is public so anon role must be able to insert spin results
create policy "Anyone can insert spin results"
  on public.spin_results for insert
  with check (true);
