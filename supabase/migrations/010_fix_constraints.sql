-- Fix type constraints and add missing columns
-- Safe to run on existing database — all operations are idempotent

-- =====================================================================
-- 1. Add theme column to profiles (used by useTheme.ts)
-- =====================================================================

alter table profiles add column if not exists theme text default 'dark';

-- =====================================================================
-- 2. Fix notifications type constraint
--    Code types: follow, comment, build_like (active)
--    TS types also define: photo_like, post_upvote, meet_rsvp
--    Keep superset for future features
-- =====================================================================

alter table notifications drop constraint if exists notifications_type_valid;
alter table notifications add constraint notifications_type_valid
  check (type in (
    'follow', 'comment', 'build_like',
    'photo_like', 'post_upvote', 'post_like',
    'rsvp', 'meet_rsvp', 'mention'
  ));

-- =====================================================================
-- 3. Fix feed_events type constraint
--    TS FeedEventType uses: new_album, new_build_entry, new_meet, new_post
--    DB RPC emit_feed_event passes p_event_type directly from client
--    Accept both short and prefixed formats for compatibility
-- =====================================================================

alter table feed_events drop constraint if exists feed_events_type_valid;
alter table feed_events add constraint feed_events_type_valid
  check (event_type in (
    'post', 'album', 'build_log', 'build_entry', 'meet', 'follow',
    'new_post', 'new_album', 'new_build_log', 'new_build_entry', 'new_meet', 'new_follow'
  ));
