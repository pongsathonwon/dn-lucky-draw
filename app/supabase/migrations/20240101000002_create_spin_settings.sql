create table public.spin_settings (
  id               uuid primary key default gen_random_uuid(),
  spin_duration    integer not null default 3,
  remove_after_win boolean not null default false,
  prize_text       text,
  prize_image_url  text,
  updated_at       timestamptz not null default now()
);

alter table public.spin_settings enable row level security;

-- Prevent inserting more than one row
create or replace function public.enforce_singleton_spin_settings()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.spin_settings) >= 1 then
    raise exception 'Only one spin_settings row is allowed';
  end if;
  return new;
end;
$$;

create trigger trg_singleton_spin_settings
  before insert on public.spin_settings
  for each row execute function public.enforce_singleton_spin_settings();

-- Seed the single row
insert into public.spin_settings (spin_duration, remove_after_win, prize_text)
values (5, false, '🎉 ยินดีด้วย! คุณได้รับรางวัลพิเศษ!');

create policy "Public can read spin settings"
  on public.spin_settings for select
  using (true);

create policy "Authenticated users can update spin settings"
  on public.spin_settings for update
  to authenticated
  using (true);
