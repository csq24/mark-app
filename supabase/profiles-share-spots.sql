-- Profile setting: share fishing spots (marks) with other signed-in users.
-- Run in Supabase SQL Editor if not already migrated.

alter table public.profiles
  add column if not exists share_spots boolean not null default false;

comment on column public.profiles.share_spots is
  'When true, other signed-in users can view this captain''s marks on the map.';

create or replace function public.user_shares_spots(captain_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.share_spots from public.profiles p where p.id = captain_id),
    false
  );
$$;

revoke all on function public.user_shares_spots(uuid) from public;
grant execute on function public.user_shares_spots(uuid) to authenticated;

drop policy if exists "marks_select_own" on public.marks;

create policy "marks_select_own_or_shared"
  on public.marks
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or public.user_shares_spots(user_id)
  );
