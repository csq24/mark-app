-- Marketplace: listings + buyer/seller messaging (run after mark-app-schema.sql)

create table public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  title text not null,
  description text not null,
  price_cents integer not null,
  condition text not null default 'good',
  photo_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_listings_category_check check (
    category in (
      'rods_reels', 'tackle', 'electronics', 'engines',
      'boat_gear', 'clothing', 'services', 'other'
    )
  ),
  constraint marketplace_listings_condition_check check (
    condition in ('new', 'like_new', 'good', 'fair')
  ),
  constraint marketplace_listings_status_check check (
    status in ('active', 'sold', 'removed')
  ),
  constraint marketplace_listings_title_length check (char_length(trim(title)) >= 3),
  constraint marketplace_listings_description_length check (char_length(trim(description)) >= 1),
  constraint marketplace_listings_price_nonneg check (price_cents >= 0)
);

create index marketplace_listings_category_created_idx
  on public.marketplace_listings (category, created_at desc)
  where status = 'active';

create index marketplace_listings_user_id_idx
  on public.marketplace_listings (user_id);

alter table public.marketplace_listings
  add constraint marketplace_listings_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

create table public.marketplace_conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings (id) on delete cascade,
  buyer_id uuid not null references auth.users (id) on delete cascade,
  seller_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_conversations_distinct_parties check (buyer_id <> seller_id),
  constraint marketplace_conversations_listing_buyer_key unique (listing_id, buyer_id)
);

create index marketplace_conversations_buyer_updated_idx
  on public.marketplace_conversations (buyer_id, updated_at desc);

create index marketplace_conversations_seller_updated_idx
  on public.marketplace_conversations (seller_id, updated_at desc);

alter table public.marketplace_conversations
  add constraint marketplace_conversations_buyer_id_profiles_fkey
  foreign key (buyer_id) references public.profiles (id) on delete cascade;

alter table public.marketplace_conversations
  add constraint marketplace_conversations_seller_id_profiles_fkey
  foreign key (seller_id) references public.profiles (id) on delete cascade;

create table public.marketplace_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.marketplace_conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint marketplace_messages_body_length check (char_length(trim(body)) >= 1)
);

create index marketplace_messages_conversation_created_idx
  on public.marketplace_messages (conversation_id, created_at asc);

alter table public.marketplace_messages
  add constraint marketplace_messages_sender_id_profiles_fkey
  foreign key (sender_id) references public.profiles (id) on delete cascade;

create or replace function public.touch_marketplace_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.marketplace_conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger marketplace_messages_touch_conversation
  after insert on public.marketplace_messages
  for each row
  execute function public.touch_marketplace_conversation();

create or replace function public.marketplace_listings_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger marketplace_listings_updated_at
  before update on public.marketplace_listings
  for each row
  execute function public.marketplace_listings_set_updated_at();

-- Start or resume a conversation (buyer messaging seller)
create or replace function public.start_marketplace_conversation(p_listing_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_buyer uuid := auth.uid();
  v_seller uuid;
  v_conversation_id uuid;
begin
  if v_buyer is null then
    raise exception 'Sign in to message the seller';
  end if;

  select user_id into v_seller
  from public.marketplace_listings
  where id = p_listing_id and status = 'active';

  if v_seller is null then
    raise exception 'Listing not found';
  end if;

  if v_seller = v_buyer then
    raise exception 'You cannot message yourself about your own listing';
  end if;

  insert into public.marketplace_conversations (listing_id, buyer_id, seller_id)
  values (p_listing_id, v_buyer, v_seller)
  on conflict (listing_id, buyer_id) do update set updated_at = now()
  returning id into v_conversation_id;

  return v_conversation_id;
end;
$$;

revoke all on function public.start_marketplace_conversation(uuid) from public;
grant execute on function public.start_marketplace_conversation(uuid) to authenticated;

alter table public.marketplace_listings enable row level security;
alter table public.marketplace_conversations enable row level security;
alter table public.marketplace_messages enable row level security;

create policy "marketplace_listings_select_authenticated"
  on public.marketplace_listings for select to authenticated using (true);

create policy "marketplace_listings_insert_own"
  on public.marketplace_listings for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "marketplace_listings_update_own"
  on public.marketplace_listings for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "marketplace_listings_delete_own"
  on public.marketplace_listings for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "marketplace_conversations_select_participant"
  on public.marketplace_conversations for select to authenticated
  using (
    buyer_id = (select auth.uid()) or seller_id = (select auth.uid())
  );

create policy "marketplace_conversations_insert_participant"
  on public.marketplace_conversations for insert to authenticated
  with check (
    buyer_id = (select auth.uid()) or seller_id = (select auth.uid())
  );

create policy "marketplace_messages_select_participant"
  on public.marketplace_messages for select to authenticated
  using (
    exists (
      select 1 from public.marketplace_conversations c
      where c.id = conversation_id
        and (c.buyer_id = (select auth.uid()) or c.seller_id = (select auth.uid()))
    )
  );

create policy "marketplace_messages_insert_participant"
  on public.marketplace_messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.marketplace_conversations c
      where c.id = conversation_id
        and (c.buyer_id = (select auth.uid()) or c.seller_id = (select auth.uid()))
    )
  );

grant all on table public.marketplace_listings to authenticated, service_role;
grant all on table public.marketplace_conversations to authenticated, service_role;
grant all on table public.marketplace_messages to authenticated, service_role;

notify pgrst, 'reload schema';
