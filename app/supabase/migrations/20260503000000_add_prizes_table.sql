create table public.prizes (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  description        text,
  image_url          text,
  wins_required      integer not null default 1,
  remove_after_win   boolean not null default false,
  is_won             boolean not null default false,
  winner_customer_id uuid references public.customers(id) on delete set null,
  is_selected        boolean not null default false,
  created_at         timestamptz not null default now()
);

-- At most one prize can be selected at a time
create unique index prizes_one_selected on public.prizes (is_selected) where is_selected = true;

alter table public.prizes enable row level security;

create policy "Public can read prizes"
  on public.prizes for select
  using (true);

create policy "Authenticated users have full access to prizes"
  on public.prizes for all
  to authenticated
  using (true)
  with check (true);

-- Seed one prize from existing spin_settings data
insert into public.prizes (name, description, image_url, wins_required, remove_after_win, is_selected)
select
  'รางวัลพิเศษ',
  prize_text,
  prize_image_url,
  wins_required,
  remove_after_win,
  true
from public.spin_settings
limit 1;

-- Drop columns that moved to prizes
alter table public.spin_settings
  drop column wins_required,
  drop column remove_after_win;
