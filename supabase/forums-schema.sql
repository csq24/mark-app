-- =============================================================================
-- Mark App — Forums (run in Supabase SQL Editor after mark-app-schema.sql)
-- =============================================================================

create table public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint forum_posts_category_check check (
    category in ('offshore', 'inshore', 'charters', 'gear', 'beginner', 'general')
  ),
  constraint forum_posts_title_length check (char_length(trim(title)) >= 3),
  constraint forum_posts_body_length check (char_length(trim(body)) >= 1)
);

comment on table public.forum_posts is 'Community forum threads.';

create index forum_posts_category_created_at_idx
  on public.forum_posts (category, created_at desc);

create index forum_posts_created_at_idx on public.forum_posts (created_at desc);

alter table public.forum_posts
  add constraint forum_posts_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

create table public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  parent_id uuid references public.forum_replies (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint forum_replies_body_length check (char_length(trim(body)) >= 1)
);

comment on table public.forum_replies is 'Replies on forum threads; optional parent for nesting.';

create index forum_replies_post_id_created_at_idx
  on public.forum_replies (post_id, created_at asc);

alter table public.forum_replies
  add constraint forum_replies_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

-- Keep forum_posts.updated_at fresh when a reply is added
create or replace function public.touch_forum_post_on_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.forum_posts
  set updated_at = now()
  where id = new.post_id;
  return new;
end;
$$;

create trigger forum_replies_touch_post
  after insert on public.forum_replies
  for each row
  execute function public.touch_forum_post_on_reply();

alter table public.forum_posts enable row level security;
alter table public.forum_replies enable row level security;

-- Anyone signed in can read the community boards
create policy "forum_posts_select_authenticated"
  on public.forum_posts
  for select
  to authenticated
  using (true);

create policy "forum_replies_select_authenticated"
  on public.forum_replies
  for select
  to authenticated
  using (true);

create policy "forum_posts_insert_own"
  on public.forum_posts
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "forum_posts_update_own"
  on public.forum_posts
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "forum_posts_delete_own"
  on public.forum_posts
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

create policy "forum_replies_insert_own"
  on public.forum_replies
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "forum_replies_update_own"
  on public.forum_replies
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "forum_replies_delete_own"
  on public.forum_replies
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

grant all on table public.forum_posts to authenticated, service_role;
grant all on table public.forum_replies to authenticated, service_role;
grant all on table public.forum_posts to postgres;
grant all on table public.forum_replies to postgres;

-- Forum author names (read-only for signed-in captains)
create policy "profiles_select_authenticated_for_forums"
  on public.profiles
  for select
  to authenticated
  using (true);
