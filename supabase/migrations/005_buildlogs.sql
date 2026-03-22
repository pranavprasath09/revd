-- Sprint 5: Build Logs
-- Tables: build_logs, build_entries, build_likes

-- ─── build_logs ──────────────────────────────────────────────
create table if not exists build_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade not null,
  car_id uuid references garage_cars(id) on delete cascade not null,
  title text not null,
  description text,
  is_public boolean default true,
  total_cost integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table build_logs enable row level security;

-- Anyone can read public build logs
create policy "build_logs_select_public" on build_logs
  for select using (is_public = true);

-- Owner can read their own (including private)
create policy "build_logs_select_own" on build_logs
  for select using (auth.uid() = owner_id);

-- Owner can insert
create policy "build_logs_insert" on build_logs
  for insert with check (auth.uid() = owner_id);

-- Owner can update
create policy "build_logs_update" on build_logs
  for update using (auth.uid() = owner_id);

-- Owner can delete
create policy "build_logs_delete" on build_logs
  for delete using (auth.uid() = owner_id);

-- ─── build_entries ───────────────────────────────────────────
create table if not exists build_entries (
  id uuid primary key default gen_random_uuid(),
  build_log_id uuid references build_logs(id) on delete cascade not null,
  title text not null,
  body text,
  cost integer default 0,
  entry_date date default current_date,
  images text[],
  created_at timestamptz default now()
);

alter table build_entries enable row level security;

-- Anyone can read entries for public build logs
create policy "build_entries_select_public" on build_entries
  for select using (
    exists (
      select 1 from build_logs where build_logs.id = build_entries.build_log_id and build_logs.is_public = true
    )
  );

-- Owner can read entries for their own logs
create policy "build_entries_select_own" on build_entries
  for select using (
    exists (
      select 1 from build_logs where build_logs.id = build_entries.build_log_id and build_logs.owner_id = auth.uid()
    )
  );

-- Owner can insert entries for their own logs
create policy "build_entries_insert" on build_entries
  for insert with check (
    exists (
      select 1 from build_logs where build_logs.id = build_entries.build_log_id and build_logs.owner_id = auth.uid()
    )
  );

-- Owner can delete entries for their own logs
create policy "build_entries_delete" on build_entries
  for delete using (
    exists (
      select 1 from build_logs where build_logs.id = build_entries.build_log_id and build_logs.owner_id = auth.uid()
    )
  );

-- ─── build_likes ─────────────────────────────────────────────
create table if not exists build_likes (
  id uuid primary key default gen_random_uuid(),
  build_log_id uuid references build_logs(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(build_log_id, user_id)
);

alter table build_likes enable row level security;

-- Anyone can read likes
create policy "build_likes_select" on build_likes
  for select using (true);

-- Authenticated users can like
create policy "build_likes_insert" on build_likes
  for insert with check (auth.uid() = user_id);

-- Users can remove their own likes
create policy "build_likes_delete" on build_likes
  for delete using (auth.uid() = user_id);
