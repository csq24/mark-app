-- Demo anglers: random profiles, share_spots on, dummy marks (dev / testing).
-- Callable from the app: select public.seed_demo_bots(3);

create or replace function public.create_demo_auth_user(demo_email text)
returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  new_id uuid := gen_random_uuid();
  inst_id uuid;
begin
  select id into inst_id from auth.instances limit 1;
  if inst_id is null then
    inst_id := '00000000-0000-0000-0000-000000000000'::uuid;
  end if;

  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  values (
    new_id,
    inst_id,
    'authenticated',
    'authenticated',
    demo_email,
    extensions.crypt('demo-bot-password', extensions.gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('demo_bot', true),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    gen_random_uuid(),
    new_id,
    jsonb_build_object('sub', new_id::text, 'email', demo_email),
    'email',
    demo_email,
    now(),
    now(),
    now()
  );

  return new_id;
end;
$$;

revoke all on function public.create_demo_auth_user(text) from public;
grant execute on function public.create_demo_auth_user(text) to service_role;

create or replace function public.seed_demo_bots(bot_count int default 3)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  caller uuid := auth.uid();
  existing_demo int;
  first_names text[] := array[
    'Reef', 'Tuna', 'Marlin', 'Gulf', 'Bay', 'Channel', 'Drift', 'Hook', 'Chum', 'Bait'
  ];
  last_names text[] := array[
    'Runner', 'Hunter', 'Captain', 'Angler', 'Strike', 'Tide', 'Line', 'Rod', 'Fin', 'Scale'
  ];
  boat_words text[] := array[
    'Sea', 'Salt', 'Blue', 'Gulf', 'Reel', 'Wake', 'Hull', 'Deck', 'Bow', 'Swell'
  ];
  mark_names text[] := array[
    'Reef edge', 'Channel bend', 'Grass flat', 'Wreck site', 'Inlet mouth',
    'Drop-off', 'Shoal', 'Pothole', 'Rock pile', 'Sand bar'
  ];
  i int;
  bot_id uuid;
  bot_email text;
  captain_name text;
  vessel text;
  marks_added int;
  total_marks int := 0;
  created_bots jsonb := '[]'::jsonb;
  marks_per_bot int;
  j int;
  base_lat double precision := 27.95;
  base_lon double precision := -82.45;
begin
  if caller is null then
    raise exception 'Sign in to add demo bots';
  end if;

  if bot_count is null or bot_count < 1 then
    bot_count := 3;
  elsif bot_count > 8 then
    bot_count := 8;
  end if;

  select count(*)::int
  into existing_demo
  from auth.users u
  where u.email like '%@mark-app.demo';

  if existing_demo + bot_count > 40 then
    raise exception 'Demo bot limit reached (max 40). Remove old demo users in Supabase Auth if needed.';
  end if;

  for i in 1..bot_count loop
    bot_email := 'demo-bot-' || replace(gen_random_uuid()::text, '-', '') || '@mark-app.demo';
    bot_id := public.create_demo_auth_user(bot_email);

    captain_name :=
      first_names[1 + floor(random() * array_length(first_names, 1))::int]
      || ' '
      || last_names[1 + floor(random() * array_length(last_names, 1))::int];

    vessel :=
      boat_words[1 + floor(random() * array_length(boat_words, 1))::int]
      || ' '
      || boat_words[1 + floor(random() * array_length(boat_words, 1))::int];

    insert into public.profiles (id, full_name, boat_name, share_spots)
    values (bot_id, captain_name, vessel, true)
    on conflict (id) do update
      set
        full_name = excluded.full_name,
        boat_name = excluded.boat_name,
        share_spots = true,
        updated_at = now();

    marks_per_bot := 2 + floor(random() * 3)::int;

    for j in 1..marks_per_bot loop
      insert into public.marks (
        user_id,
        name,
        latitude,
        longitude,
        description
      )
      values (
        bot_id,
        mark_names[1 + floor(random() * array_length(mark_names, 1))::int],
        base_lat + (random() - 0.5) * 2.8,
        base_lon + (random() - 0.5) * 3.2,
        'demo_seed'
      );
      total_marks := total_marks + 1;
    end loop;

    created_bots := created_bots || jsonb_build_array(
      jsonb_build_object(
        'id', bot_id,
        'email', bot_email,
        'full_name', captain_name,
        'boat_name', vessel,
        'marks', marks_per_bot
      )
    );
  end loop;

  return jsonb_build_object(
    'bots_created', bot_count,
    'marks_created', total_marks,
    'bots', created_bots
  );
end;
$$;

revoke all on function public.seed_demo_bots(int) from public;
grant execute on function public.seed_demo_bots(int) to authenticated;
