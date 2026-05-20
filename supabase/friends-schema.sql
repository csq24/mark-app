-- Friends list: shared marks only visible to friends when share_spots is on.

create table if not exists public.friends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  friend_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  source text not null default 'manual',
  constraint friends_no_self check (user_id <> friend_id),
  constraint friends_user_id_friend_id_key unique (user_id, friend_id)
);

create index if not exists friends_user_id_idx on public.friends (user_id);

alter table public.friends
  drop constraint if exists friends_friend_id_profiles_fkey;

alter table public.friends
  add constraint friends_friend_id_profiles_fkey
  foreign key (friend_id) references public.profiles (id) on delete cascade;

comment on table public.friends is 'Captain added another user as a friend (one-way).';

-- Bypass RLS when checking friendship for mark visibility
create or replace function public.are_friends(viewer_id uuid, owner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.friends f
    where f.user_id = viewer_id
      and f.friend_id = owner_id
  );
$$;

revoke all on function public.are_friends(uuid, uuid) from public;
grant execute on function public.are_friends(uuid, uuid) to authenticated;

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

-- Marks: yours, or a friend who enabled share_spots (when you want to see them)
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

-- Friends table RLS
alter table public.friends enable row level security;

drop policy if exists "friends_select_own" on public.friends;
drop policy if exists "friends_insert_own" on public.friends;
drop policy if exists "friends_delete_own" on public.friends;

create policy "friends_select_own"
  on public.friends
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "friends_insert_own"
  on public.friends
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "friends_delete_own"
  on public.friends
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Read profiles of people you added as friends (for the friends list UI)
drop policy if exists "profiles_select_friends" on public.profiles;

create policy "profiles_select_friends"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.friends f
      where f.user_id = (select auth.uid())
        and f.friend_id = profiles.id
    )
  );

grant all on table public.friends to authenticated, service_role;

notify pgrst, 'reload schema';
