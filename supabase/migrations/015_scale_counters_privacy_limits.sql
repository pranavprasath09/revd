-- Migration 015: scale counters, privacy fixes, input bounds, query indexes
-- ──────────────────────────────────────────────────────────────────────────────
-- Idempotent: safe to re-run via the Supabase dashboard SQL editor.
--
-- Pre-launch hardening for a large traffic wave. Fixes from the June 2026
-- scalability audit:
--   1. SCALE   The meet feed, builds feed, and meet-detail page counted RSVPs /
--              likes / entries by pulling EVERY row to the browser and calling
--              .length. A meet or build shared to a 100k-follower audience would
--              ship tens of thousands of rows per page view. Replaced with
--              denormalized counter columns maintained by triggers (atomic,
--              concurrency-safe) + a one-time backfill. The frontend now reads
--              meets.rsvp_count / build_logs.like_count / build_logs.entry_count.
--   2. PRIVACY albums/album_photos SELECT used `using (true)`, ignoring the
--              is_public column the schema promises — private albums were world
--              readable via the anon API. Now mirrors build_logs (public OR own).
--   3. PROFILE garage_cars SELECT was own-rows-only, so the profile portfolio
--              rendered every other user's garage empty. Made publicly readable
--              (portfolio content). NOTE: this exposes garage_cars.notes — see
--              the deploy report if any notes were meant to be private.
--   4. ABUSE   No user-text column had a length bound, so a single request could
--              insert a multi-megabyte title/body. Added CHECK length caps
--              (NOT VALID: enforced on all new writes, no scan of existing rows)
--              and bounded build_entries.cost.
--   5. PERF    Missing indexes on FK / WHERE / ORDER BY columns used by the
--              feeds. Added (idempotent) the composite (col, created_at) indexes
--              the list queries actually sort on.

-- ════════════════════════════════════════════════════════════
-- 1. Denormalized counters + triggers + backfill
-- ════════════════════════════════════════════════════════════

-- ── meets.rsvp_count ────────────────────────────────────────
alter table meets add column if not exists rsvp_count integer not null default 0;

create or replace function bump_meet_rsvp_count()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    update public.meets set rsvp_count = rsvp_count + 1 where id = new.meet_id;
    return new;
  else
    update public.meets set rsvp_count = greatest(rsvp_count - 1, 0) where id = old.meet_id;
    return old;
  end if;
end $$;

drop trigger if exists meet_rsvps_count_trg on meet_rsvps;
create trigger meet_rsvps_count_trg
  after insert or delete on meet_rsvps
  for each row execute function bump_meet_rsvp_count();

-- ── build_logs.like_count + entry_count ─────────────────────
alter table build_logs add column if not exists like_count integer not null default 0;
alter table build_logs add column if not exists entry_count integer not null default 0;

create or replace function bump_build_like_count()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    update public.build_logs set like_count = like_count + 1 where id = new.build_log_id;
    return new;
  else
    update public.build_logs set like_count = greatest(like_count - 1, 0) where id = old.build_log_id;
    return old;
  end if;
end $$;

drop trigger if exists build_likes_count_trg on build_likes;
create trigger build_likes_count_trg
  after insert or delete on build_likes
  for each row execute function bump_build_like_count();

create or replace function bump_build_entry_count()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    update public.build_logs set entry_count = entry_count + 1 where id = new.build_log_id;
    return new;
  else
    update public.build_logs set entry_count = greatest(entry_count - 1, 0) where id = old.build_log_id;
    return old;
  end if;
end $$;

drop trigger if exists build_entries_count_trg on build_entries;
create trigger build_entries_count_trg
  after insert or delete on build_entries
  for each row execute function bump_build_entry_count();

-- One-time backfill so existing rows are truthful (idempotent: recomputes).
update meets m set
  rsvp_count = (select count(*) from meet_rsvps r where r.meet_id = m.id);
update build_logs b set
  like_count = (select count(*) from build_likes l where l.build_log_id = b.id),
  entry_count = (select count(*) from build_entries e where e.build_log_id = b.id);

-- ════════════════════════════════════════════════════════════
-- 2. albums / album_photos must honor is_public
-- ════════════════════════════════════════════════════════════
drop policy if exists "Albums are viewable by everyone" on albums;
drop policy if exists "albums_select_public_or_own" on albums;
create policy "albums_select_public_or_own" on albums
  for select using (is_public = true or auth.uid() = creator_id);

drop policy if exists "Album photos are viewable by everyone" on album_photos;
drop policy if exists "album_photos_select_public_or_own" on album_photos;
create policy "album_photos_select_public_or_own" on album_photos
  for select using (
    exists (
      select 1 from albums a
      where a.id = album_photos.album_id
        and (a.is_public = true or a.creator_id = auth.uid())
    )
  );

-- ════════════════════════════════════════════════════════════
-- 3. garage_cars readable for profile portfolios
-- ════════════════════════════════════════════════════════════
-- Was own-rows-only, which broke the public profile garage display.
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'garage_cars' and policyname = 'Garages are viewable by everyone'
  ) then
    create policy "Garages are viewable by everyone"
      on garage_cars for select using (true);
  end if;
end $$;
-- Drop the old own-only SELECT so it doesn't shadow the public one's intent.
drop policy if exists "Users can view their own garage" on garage_cars;

-- ════════════════════════════════════════════════════════════
-- 4. Input bounds (NOT VALID: enforced on new writes, no full-table scan)
-- ════════════════════════════════════════════════════════════
do $$
declare
  c record;
begin
  for c in
    select * from (values
      ('profiles',      'profiles_display_name_len', 'char_length(display_name) <= 100'),
      ('profiles',      'profiles_bio_len',          'char_length(bio) <= 2000'),
      ('garage_cars',   'garage_nickname_len',       'char_length(nickname) <= 100'),
      ('garage_cars',   'garage_year_len',           'char_length(year) <= 10'),
      ('garage_cars',   'garage_notes_len',          'char_length(notes) <= 5000'),
      ('meets',         'meets_name_len',            'char_length(name) <= 200'),
      ('meets',         'meets_description_len',      'char_length(description) <= 5000'),
      ('meets',         'meets_location_len',         'char_length(location_name) <= 300'),
      ('albums',        'albums_title_len',          'char_length(title) <= 200'),
      ('albums',        'albums_description_len',     'char_length(description) <= 5000'),
      ('album_photos',  'album_photos_caption_len',   'char_length(caption) <= 500'),
      ('album_photos',  'album_photos_cartag_len',    'char_length(car_tag) <= 100'),
      ('communities',   'communities_name_len',       'char_length(name) <= 100'),
      ('communities',   'communities_description_len','char_length(description) <= 2000'),
      ('posts',         'posts_title_len',            'char_length(title) <= 300'),
      ('posts',         'posts_body_len',             'char_length(body) <= 20000'),
      ('comments',      'comments_body_len',          'char_length(body) <= 10000'),
      ('build_logs',    'build_logs_title_len',       'char_length(title) <= 200'),
      ('build_logs',    'build_logs_description_len', 'char_length(description) <= 5000'),
      ('build_entries', 'build_entries_title_len',    'char_length(title) <= 200'),
      ('build_entries', 'build_entries_body_len',     'char_length(body) <= 20000'),
      ('build_entries', 'build_entries_cost_bound',   'cost >= 0 and cost <= 10000000')
    ) as t(tbl, conname, expr)
  loop
    if not exists (select 1 from pg_constraint where conname = c.conname) then
      execute format(
        'alter table %I add constraint %I check (%s) not valid',
        c.tbl, c.conname, c.expr
      );
    end if;
  end loop;
end $$;

-- ════════════════════════════════════════════════════════════
-- 5. Indexes on FK / WHERE / ORDER BY columns the feeds use
-- ════════════════════════════════════════════════════════════
-- Forums
create index if not exists idx_posts_community_created on posts(community_id, created_at desc);
create index if not exists idx_posts_author on posts(author_id);
create index if not exists idx_comments_post_created on comments(post_id, created_at);
create index if not exists idx_comments_author on comments(author_id);
create index if not exists idx_post_votes_post on post_votes(post_id);
create index if not exists idx_post_votes_user on post_votes(user_id);
create index if not exists idx_comment_votes_comment on comment_votes(comment_id);
create index if not exists idx_comment_votes_user on comment_votes(user_id);
create index if not exists idx_community_members_community on community_members(community_id);
create index if not exists idx_community_members_user on community_members(user_id);
-- Photos
create index if not exists idx_albums_creator on albums(creator_id);
create index if not exists idx_albums_public_created on albums(is_public, created_at desc);
create index if not exists idx_album_photos_album on album_photos(album_id);
-- Builds
create index if not exists idx_build_entries_log on build_entries(build_log_id);
create index if not exists idx_build_likes_log on build_likes(build_log_id);
create index if not exists idx_build_likes_user on build_likes(user_id);
create index if not exists idx_build_logs_public_created on build_logs(is_public, created_at desc);
-- Social / feed
create index if not exists idx_follows_follower on follows(follower_id);
create index if not exists idx_follows_following on follows(following_id);
create index if not exists idx_notifications_user_created on notifications(user_id, created_at desc);
create index if not exists idx_feed_events_user_created on feed_events(user_id, created_at desc);
