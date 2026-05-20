-- Run in Supabase SQL Editor after mark-app-schema.sql
-- Bucket for catch photos: {user_id}/{catch_id}.{ext}

insert into storage.buckets (id, name, public)
values ('catch-photos', 'catch-photos', true)
on conflict (id) do nothing;

create policy "catch_photos_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'catch-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "catch_photos_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'catch-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "catch_photos_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'catch-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'catch-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "catch_photos_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'catch-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
