-- Sprint 3: Photo Albums, Album Photos, Follows
-- ─────────────────────────────────────────────

-- Albums
create table if not exists albums (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references profiles(id) not null,
  title text not null,
  description text,
  cover_image text,
  car_tags text[] default '{}',
  is_public boolean default true,
  created_at timestamptz default now()
);

alter table albums enable row level security;

create policy "Albums are viewable by everyone"
  on albums for select using (true);

create policy "Users can insert their own albums"
  on albums for insert with check (auth.uid() = creator_id);

create policy "Users can update their own albums"
  on albums for update using (auth.uid() = creator_id);

create policy "Users can delete their own albums"
  on albums for delete using (auth.uid() = creator_id);

-- Album Photos
create table if not exists album_photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references albums(id) on delete cascade not null,
  image_url text not null,
  caption text,
  car_tag text,
  order_index integer default 0,
  created_at timestamptz default now()
);

alter table album_photos enable row level security;

create policy "Album photos are viewable by everyone"
  on album_photos for select using (true);

create policy "Users can insert photos to their own albums"
  on album_photos for insert with check (
    auth.uid() = (select creator_id from albums where id = album_id)
  );

create policy "Users can delete photos from their own albums"
  on album_photos for delete using (
    auth.uid() = (select creator_id from albums where id = album_id)
  );

-- Follows
create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references profiles(id) not null,
  following_id uuid references profiles(id) not null,
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);

alter table follows enable row level security;

create policy "Follows are viewable by everyone"
  on follows for select using (true);

create policy "Users can follow others"
  on follows for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on follows for delete using (auth.uid() = follower_id);

-- Storage bucket for photos (run manually in Supabase dashboard if needed)
-- insert into storage.buckets (id, name, public) values ('photos', 'photos', true);
