-- Sprint 1 + 2 Foundation: profiles, garage_cars, meets, meet_rsvps
-- These tables were created manually in Supabase but never had migration files.
-- Using IF NOT EXISTS throughout so this is safe to run on an existing database.

-- =====================================================================
-- 1. PROFILES
-- =====================================================================

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  tier text default 'free',
  created_at timestamptz default now()
);

alter table profiles enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Profiles are viewable by everyone') then
    create policy "Profiles are viewable by everyone"
      on profiles for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can insert their own profile') then
    create policy "Users can insert their own profile"
      on profiles for insert with check (auth.uid() = id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can update their own profile') then
    create policy "Users can update their own profile"
      on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
  end if;
end $$;

-- =====================================================================
-- 2. GARAGE_CARS
-- =====================================================================

create table if not exists garage_cars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  car_id text not null,
  nickname text,
  year text,
  notes text default '',
  mods jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table garage_cars enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'garage_cars' and policyname = 'Users can view their own garage') then
    create policy "Users can view their own garage"
      on garage_cars for select using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'garage_cars' and policyname = 'Users can add cars to their garage') then
    create policy "Users can add cars to their garage"
      on garage_cars for insert with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'garage_cars' and policyname = 'Users can update their own cars') then
    create policy "Users can update their own cars"
      on garage_cars for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'garage_cars' and policyname = 'Users can delete their own cars') then
    create policy "Users can delete their own cars"
      on garage_cars for delete using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists idx_garage_cars_user on garage_cars(user_id);

-- =====================================================================
-- 3. MEETS
-- =====================================================================

create table if not exists meets (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  location_name text,
  location_lat float,
  location_lng float,
  date date not null,
  time time,
  meet_type text,
  cover_image_url text,
  max_attendees integer,
  created_at timestamptz default now()
);

alter table meets enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'meets' and policyname = 'Meets are viewable by everyone') then
    create policy "Meets are viewable by everyone"
      on meets for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'meets' and policyname = 'Authenticated users can create meets') then
    create policy "Authenticated users can create meets"
      on meets for insert with check (auth.uid() = creator_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'meets' and policyname = 'Creators can update their own meets') then
    create policy "Creators can update their own meets"
      on meets for update using (auth.uid() = creator_id) with check (auth.uid() = creator_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'meets' and policyname = 'Creators can delete their own meets') then
    create policy "Creators can delete their own meets"
      on meets for delete using (auth.uid() = creator_id);
  end if;
end $$;

create index if not exists idx_meets_creator on meets(creator_id);
create index if not exists idx_meets_date on meets(date);

-- =====================================================================
-- 4. MEET_RSVPS
-- =====================================================================

create table if not exists meet_rsvps (
  id uuid primary key default gen_random_uuid(),
  meet_id uuid references meets(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(meet_id, user_id)
);

alter table meet_rsvps enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'meet_rsvps' and policyname = 'RSVPs are viewable by everyone') then
    create policy "RSVPs are viewable by everyone"
      on meet_rsvps for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'meet_rsvps' and policyname = 'Authenticated users can RSVP') then
    create policy "Authenticated users can RSVP"
      on meet_rsvps for insert with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'meet_rsvps' and policyname = 'Users can remove their own RSVP') then
    create policy "Users can remove their own RSVP"
      on meet_rsvps for delete using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists idx_meet_rsvps_meet on meet_rsvps(meet_id);
create index if not exists idx_meet_rsvps_user on meet_rsvps(user_id);
