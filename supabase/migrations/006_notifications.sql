-- Sprint 6: Notifications + Feed
-- Tables: notifications, feed_events

-- ─── notifications ─────────────────────────────────────────────
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  actor_id uuid references profiles(id) on delete cascade not null,
  type text not null,
  entity_type text,
  entity_id uuid,
  message text,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;

-- Users can only read their own notifications
create policy "notifications_select_own" on notifications
  for select using (auth.uid() = user_id);

-- Users can only update their own notifications (mark as read)
create policy "notifications_update_own" on notifications
  for update using (auth.uid() = user_id);

-- Authenticated users can insert notifications (for others)
create policy "notifications_insert" on notifications
  for insert with check (auth.uid() = actor_id);

-- Users can delete their own notifications
create policy "notifications_delete_own" on notifications
  for delete using (auth.uid() = user_id);

-- Index for fast lookup
create index if not exists idx_notifications_user on notifications(user_id, is_read, created_at desc);

-- ─── feed_events ───────────────────────────────────────────────
create table if not exists feed_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  actor_id uuid references profiles(id) on delete cascade not null,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

alter table feed_events enable row level security;

-- Users can only read their own feed
create policy "feed_events_select_own" on feed_events
  for select using (auth.uid() = user_id);

-- Authenticated users can insert feed events
create policy "feed_events_insert" on feed_events
  for insert with check (auth.uid() IS NOT NULL);

-- Index for fast feed queries
create index if not exists idx_feed_events_user on feed_events(user_id, created_at desc);
