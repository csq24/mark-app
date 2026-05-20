-- =============================================================================
-- Mark App — Supabase schema (run in SQL Editor)
-- Tables: profiles, marks, catches
-- RLS: captains can only access their own rows
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. profiles
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  updated_at timestamptz not null default now(),
  full_name text,
  boat_name text,
  share_spots boolean not null default false
);

comment on column public.profiles.share_spots is
  'When true, other signed-in users can view this captain''s marks on the map.';

comment on table public.profiles is 'Captain profile; one row per auth user.';

-- -----------------------------------------------------------------------------
-- 2. marks (fishing spots)
-- -----------------------------------------------------------------------------
create table public.marks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  description text,
  photo_url text,
  created_at timestamptz not null default now(),
  constraint marks_latitude_range check (latitude >= -90 and latitude <= 90),
  constraint marks_longitude_range check (longitude >= -180 and longitude <= 180)
);

comment on table public.marks is 'Saved fishing spots on the map.';

create index marks_user_id_idx on public.marks (user_id);
create index marks_user_id_created_at_idx on public.marks (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- 3. catches
-- -----------------------------------------------------------------------------
create table public.catches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mark_id uuid references public.marks (id) on delete set null,
  fish_type text not null,
  weight_lbs numeric(8, 2),
  water_depth_ft numeric(8, 2),
  notes text,
  photo_url text,
  created_at timestamptz not null default now(),
  constraint catches_weight_non_negative check (
    weight_lbs is null or weight_lbs >= 0
  ),
  constraint catches_depth_non_negative check (
    water_depth_ft is null or water_depth_ft >= 0
  )
);

comment on table public.catches is 'Catch logs; optional link to a mark.';

create index catches_user_id_idx on public.catches (user_id);
create index catches_user_id_created_at_idx on public.catches (user_id, created_at desc);
create index catches_mark_id_idx on public.catches (mark_id);

-- -----------------------------------------------------------------------------
-- 4. Triggers & functions
-- -----------------------------------------------------------------------------

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Keep profiles.updated_at current
create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_profiles_updated_at();

-- Catches may only reference a mark owned by the same captain
create or replace function public.enforce_catch_mark_owner()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.mark_id is not null then
    if not exists (
      select 1
      from public.marks m
      where m.id = new.mark_id
        and m.user_id = new.user_id
    ) then
      raise exception 'mark_id must belong to the same user as the catch';
    end if;
  end if;
  return new;
end;
$$;

create trigger catches_enforce_mark_owner
  before insert or update on public.catches
  for each row
  execute function public.enforce_catch_mark_owner();

-- -----------------------------------------------------------------------------
-- 5. Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.marks enable row level security;
alter table public.catches enable row level security;

-- profiles: own row only
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "profiles_delete_own"
  on public.profiles
  for delete
  to authenticated
  using (id = (select auth.uid()));

-- Marks visible to owner or to others when captain enabled share_spots
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

create policy "marks_select_own_or_shared"
  on public.marks
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or public.user_shares_spots(user_id)
  );

create policy "marks_insert_own"
  on public.marks
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "marks_update_own"
  on public.marks
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "marks_delete_own"
  on public.marks
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- catches: own rows only
create policy "catches_select_own"
  on public.catches
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "catches_insert_own"
  on public.catches
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "catches_update_own"
  on public.catches
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "catches_delete_own"
  on public.catches
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- 6. Grants (Supabase API roles)
-- -----------------------------------------------------------------------------
grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on table public.profiles to authenticated, service_role;
grant all on table public.marks to authenticated, service_role;
grant all on table public.catches to authenticated, service_role;

grant all on table public.profiles to postgres;
grant all on table public.marks to postgres;
grant all on table public.catches to postgres;
