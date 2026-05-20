-- Run after mark-app-schema.sql and marks-photo-url.sql
-- Bucket: mark-photos — paths {user_id}/{mark_id}.{ext} (public read for shared spots)

insert into storage.buckets (id, name, public)
values ('mark-photos', 'mark-photos', true)
on conflict (id) do nothing;

create policy "mark_photos_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'mark-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "mark_photos_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'mark-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "mark_photos_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'mark-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'mark-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "mark_photos_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'mark-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
