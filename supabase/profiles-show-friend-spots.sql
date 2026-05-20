-- Viewer preference: show friends' shared marks on your map (default on).

alter table public.profiles
  add column if not exists show_friend_spots boolean not null default true;

comment on column public.profiles.show_friend_spots is
  'When true, this captain sees shared marks from friends on the map.';

create or replace function public.viewer_shows_friend_spots()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.show_friend_spots from public.profiles p where p.id = auth.uid()),
    true
  );
$$;

revoke all on function public.viewer_shows_friend_spots() from public;
grant execute on function public.viewer_shows_friend_spots() to authenticated;

drop policy if exists "marks_select_own_or_shared" on public.marks;

create policy "marks_select_own_or_shared"
  on public.marks
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (
      public.user_shares_spots(user_id)
      and public.are_friends((select auth.uid()), user_id)
      and public.viewer_shows_friend_spots()
    )
  );

notify pgrst, 'reload schema';
