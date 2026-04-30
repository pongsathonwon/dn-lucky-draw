insert into storage.buckets (id, name, public)
values ('prize-images', 'prize-images', true);

create policy "Public read prize images"
  on storage.objects for select
  using (bucket_id = 'prize-images');

create policy "Authenticated upload prize images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'prize-images');

create policy "Authenticated delete prize images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'prize-images');
