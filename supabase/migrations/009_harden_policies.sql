-- Sprint 9: Harden RLS policies across all tables
-- ──────────────────────────────────────────────────────────────
-- Idempotent: every create policy is preceded by drop policy if exists,
-- so this is safe to re-run against a database where some policies already exist.

-- ═══════════════════════════════════════════════════════════════
-- 1. NOTIFICATIONS — remove client INSERT, add trusted RPCs
-- ═══════════════════════════════════════════════════════════════

-- Remove the permissive insert policy — clients should NOT insert directly
drop policy if exists "notifications_insert" on notifications;

-- Deny all client inserts; notifications created via SECURITY DEFINER RPCs only
drop policy if exists "notifications_insert_denied" on notifications;
create policy "notifications_insert_denied" on notifications
  for insert with check (false);

-- Add WITH CHECK to the update policy to prevent user_id reassignment
drop policy if exists "notifications_update_own" on notifications;
create policy "notifications_update_own" on notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Add type constraint
alter table notifications drop constraint if exists notifications_type_valid;
alter table notifications add constraint notifications_type_valid
  check (type in ('follow', 'comment', 'build_like', 'post_like', 'rsvp', 'mention'));

-- Trusted RPC: create notification for a follow action
create or replace function notify_on_follow(target_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  -- Don't notify yourself
  if auth.uid() = target_user_id then return; end if;

  -- Verify the follow actually exists
  if not exists (
    select 1 from public.follows
    where follower_id = auth.uid() and following_id = target_user_id
  ) then
    raise exception 'Follow relationship does not exist';
  end if;

  insert into public.notifications (user_id, actor_id, type, entity_type, entity_id)
  values (target_user_id, auth.uid(), 'follow', 'profile', auth.uid());
end $$;

-- Trusted RPC: create notification for a comment action
create or replace function notify_on_comment(p_post_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_author_id uuid;
begin
  select author_id into v_author_id from public.posts where id = p_post_id;
  if v_author_id is null or v_author_id = auth.uid() then return; end if;

  insert into public.notifications (user_id, actor_id, type, entity_type, entity_id)
  values (v_author_id, auth.uid(), 'comment', 'post', p_post_id);
end $$;

-- Trusted RPC: create notification for a build_like action
create or replace function notify_on_build_like(p_build_log_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_owner_id uuid;
begin
  select owner_id into v_owner_id from public.build_logs where id = p_build_log_id;
  if v_owner_id is null or v_owner_id = auth.uid() then return; end if;

  -- Only notify if the like actually exists (prevent spam)
  if not exists (
    select 1 from public.build_likes
    where build_log_id = p_build_log_id and user_id = auth.uid()
  ) then
    return;
  end if;

  insert into public.notifications (user_id, actor_id, type, entity_type, entity_id)
  values (v_owner_id, auth.uid(), 'build_like', 'build_log', p_build_log_id);
end $$;

-- ═══════════════════════════════════════════════════════════════
-- 2. FEED_EVENTS — remove client INSERT, add trusted RPC
-- ═══════════════════════════════════════════════════════════════

drop policy if exists "feed_events_insert" on feed_events;

drop policy if exists "feed_events_insert_denied" on feed_events;
create policy "feed_events_insert_denied" on feed_events
  for insert with check (false);

-- Add event_type constraint
alter table feed_events drop constraint if exists feed_events_type_valid;
alter table feed_events add constraint feed_events_type_valid
  check (event_type in ('post', 'album', 'build_log', 'build_entry', 'meet', 'follow'));

-- Trusted RPC: fan out a feed event to all followers of the calling user
create or replace function emit_feed_event(
  p_event_type text,
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_metadata jsonb default null
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.feed_events (user_id, actor_id, event_type, entity_type, entity_id, metadata)
  select f.follower_id, auth.uid(), p_event_type, p_entity_type, p_entity_id, p_metadata
  from public.follows f
  where f.following_id = auth.uid();
end $$;

-- ═══════════════════════════════════════════════════════════════
-- 3. ALBUMS — add WITH CHECK to UPDATE policy
-- ═══════════════════════════════════════════════════════════════

drop policy if exists "Users can update their own albums" on albums;
drop policy if exists "albums_update_own" on albums;
create policy "albums_update_own" on albums
  for update using (auth.uid() = creator_id) with check (auth.uid() = creator_id);

-- Add UPDATE policy for album_photos
drop policy if exists "album_photos_update_own" on album_photos;
create policy "album_photos_update_own" on album_photos
  for update using (
    auth.uid() = (select creator_id from albums where id = album_id)
  ) with check (
    auth.uid() = (select creator_id from albums where id = album_id)
  );

-- ═══════════════════════════════════════════════════════════════
-- 4. BUILD_LOGS — add WITH CHECK to UPDATE policy
-- ═══════════════════════════════════════════════════════════════

drop policy if exists "build_logs_update" on build_logs;
create policy "build_logs_update" on build_logs
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Add UPDATE policy for build_entries
drop policy if exists "build_entries_update_own" on build_entries;
create policy "build_entries_update_own" on build_entries
  for update using (
    exists (select 1 from build_logs where build_logs.id = build_entries.build_log_id and build_logs.owner_id = auth.uid())
  ) with check (
    exists (select 1 from build_logs where build_logs.id = build_entries.build_log_id and build_logs.owner_id = auth.uid())
  );

-- ═══════════════════════════════════════════════════════════════
-- 5. COMMUNITIES — add UPDATE policy for creators
-- ═══════════════════════════════════════════════════════════════

drop policy if exists "communities_update_own" on communities;
create policy "communities_update_own" on communities
  for update using (auth.uid() = creator_id) with check (auth.uid() = creator_id);

-- ═══════════════════════════════════════════════════════════════
-- 6. POSTS + COMMENTS — add UPDATE policies
-- ═══════════════════════════════════════════════════════════════

drop policy if exists "posts_update_own" on posts;
create policy "posts_update_own" on posts
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists "comments_update_own" on comments;
create policy "comments_update_own" on comments
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

-- ═══════════════════════════════════════════════════════════════
-- 7. FOLLOWS — prevent self-follow
-- ═══════════════════════════════════════════════════════════════

alter table follows drop constraint if exists follows_no_self;
alter table follows add constraint follows_no_self
  check (follower_id <> following_id);

-- ═══════════════════════════════════════════════════════════════
-- 8. NOT NULL constraints on vote tables
-- ═══════════════════════════════════════════════════════════════

alter table post_votes alter column post_id set not null;
alter table post_votes alter column user_id set not null;
alter table comment_votes alter column comment_id set not null;
alter table comment_votes alter column user_id set not null;

-- ═══════════════════════════════════════════════════════════════
-- 9. STORAGE BUCKET POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Create buckets if they don't exist
insert into storage.buckets (id, name, public, allowed_mime_types)
values
  ('photos', 'photos', true, array['image/jpeg', 'image/png', 'image/webp']),
  ('builds', 'builds', true, array['image/jpeg', 'image/png', 'image/webp']),
  ('posts', 'posts', true, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  allowed_mime_types = excluded.allowed_mime_types;

-- Photos bucket policies
drop policy if exists "photos_insert_own" on storage.objects;
create policy "photos_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "photos_update_own" on storage.objects;
create policy "photos_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "photos_delete_own" on storage.objects;
create policy "photos_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "photos_read_all" on storage.objects;
create policy "photos_read_all" on storage.objects
  for select using (bucket_id = 'photos');

-- Builds bucket policies
drop policy if exists "builds_insert_own" on storage.objects;
create policy "builds_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'builds' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "builds_update_own" on storage.objects;
create policy "builds_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'builds' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "builds_delete_own" on storage.objects;
create policy "builds_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'builds' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "builds_read_all" on storage.objects;
create policy "builds_read_all" on storage.objects
  for select using (bucket_id = 'builds');

-- Posts bucket policies
drop policy if exists "posts_insert_own" on storage.objects;
create policy "posts_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'posts' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "posts_update_own" on storage.objects;
create policy "posts_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'posts' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "posts_delete_own" on storage.objects;
create policy "posts_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'posts' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "posts_read_all" on storage.objects;
create policy "posts_read_all" on storage.objects
  for select using (bucket_id = 'posts');

-- ═══════════════════════════════════════════════════════════════
-- 10. FK INDEXES for performance
-- ═══════════════════════════════════════════════════════════════

create index if not exists idx_albums_creator on albums(creator_id);
create index if not exists idx_album_photos_album on album_photos(album_id);
create index if not exists idx_follows_follower on follows(follower_id);
create index if not exists idx_follows_following on follows(following_id);
create index if not exists idx_posts_community on posts(community_id);
create index if not exists idx_posts_author on posts(author_id);
create index if not exists idx_comments_post on comments(post_id);
create index if not exists idx_comments_author on comments(author_id);
create index if not exists idx_post_votes_post on post_votes(post_id);
create index if not exists idx_post_votes_user on post_votes(user_id);
create index if not exists idx_comment_votes_comment on comment_votes(comment_id);
create index if not exists idx_comment_votes_user on comment_votes(user_id);
create index if not exists idx_community_members_community on community_members(community_id);
create index if not exists idx_community_members_user on community_members(user_id);
create index if not exists idx_build_entries_log on build_entries(build_log_id);
create index if not exists idx_build_likes_log on build_likes(build_log_id);

-- ═══════════════════════════════════════════════════════════════
-- 11. Comment count update RPC (replaces client-side counter mutation)
-- ═══════════════════════════════════════════════════════════════

create or replace function update_comment_count(p_post_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.posts
  set comment_count = (
    select count(*) from public.comments where post_id = p_post_id
  )
  where id = p_post_id;
end $$;
