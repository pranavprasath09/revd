-- Migration 014: counter triggers, FK cascades, RPC hardening, premium-trigger fix
-- ──────────────────────────────────────────────────────────────────────────────
-- Idempotent: safe to re-run via the Supabase dashboard SQL editor.
--
-- Fixes from the June 2026 full audit:
--   1. CRITICAL  profiles_protect_premium read the legacy GUC
--                request.jwt.claim.role, which is NULL on modern Supabase — so
--                the trigger reverted EVERY premium write, including the Stripe
--                webhook's. Paying users never got is_premium. Now reads
--                request.jwt.claims and only reverts for real client roles
--                (anon/authenticated), so service_role and dashboard admin
--                edits pass through. Also guards the INSERT path.
--   2. HIGH      posts.upvotes / comments.upvotes / communities.member_count
--                were never written by anything — counts displayed as 0/blank
--                forever. Maintained by triggers now (atomic, concurrency-safe)
--                with a one-time backfill.
--   3. HIGH      albums/follows FKs lacked on delete cascade — deleting any
--                active user errored (GDPR deletion blocked).
--   4. HIGH      notify_on_comment / emit_feed_event were spammable SECURITY
--                DEFINER RPCs (no existence check / no rate cap). Hardened, and
--                execution revoked from anon.
--   5. MEDIUM    communities INSERT didn't bind creator_id (spoofing).
--   6. MEDIUM    storage buckets had no server-side size limit (client-only).
--   7. LOW       missing FK indexes on cascade/lookup paths.

-- ════════════════════════════════════════════════════════════
-- 1. Fix profiles_protect_premium
-- ════════════════════════════════════════════════════════════
create or replace function profiles_protect_premium()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_role text := coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
    current_setting('request.jwt.claim.role', true)
  );
begin
  -- Only revert for actual PostgREST client roles. service_role, dashboard
  -- sessions, and direct connections (v_role null) are trusted.
  if v_role in ('anon', 'authenticated') then
    if tg_op = 'UPDATE' then
      new.is_premium := old.is_premium;
      new.tier := old.tier;
    else
      new.is_premium := false;
      new.tier := 'free';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists profiles_protect_premium_trg on profiles;
create trigger profiles_protect_premium_trg
  before insert or update on profiles
  for each row execute function profiles_protect_premium();

-- ════════════════════════════════════════════════════════════
-- 2. Counter triggers + backfill
-- ════════════════════════════════════════════════════════════
create or replace function bump_post_upvotes()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set upvotes = upvotes + 1 where id = new.post_id;
    return new;
  else
    update public.posts set upvotes = greatest(upvotes - 1, 0) where id = old.post_id;
    return old;
  end if;
end $$;

drop trigger if exists post_votes_count_trg on post_votes;
create trigger post_votes_count_trg
  after insert or delete on post_votes
  for each row execute function bump_post_upvotes();

create or replace function bump_comment_upvotes()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    update public.comments set upvotes = upvotes + 1 where id = new.comment_id;
    return new;
  else
    update public.comments set upvotes = greatest(upvotes - 1, 0) where id = old.comment_id;
    return old;
  end if;
end $$;

drop trigger if exists comment_votes_count_trg on comment_votes;
create trigger comment_votes_count_trg
  after insert or delete on comment_votes
  for each row execute function bump_comment_upvotes();

create or replace function bump_comment_count()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
    return new;
  else
    update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
    return old;
  end if;
end $$;

drop trigger if exists comments_count_trg on comments;
create trigger comments_count_trg
  after insert or delete on comments
  for each row execute function bump_comment_count();

create or replace function bump_member_count()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    update public.communities set member_count = member_count + 1 where id = new.community_id;
    return new;
  else
    update public.communities set member_count = greatest(member_count - 1, 0) where id = old.community_id;
    return old;
  end if;
end $$;

drop trigger if exists community_members_count_trg on community_members;
create trigger community_members_count_trg
  after insert or delete on community_members
  for each row execute function bump_member_count();

-- One-time backfill so existing rows become truthful (idempotent: recomputes).
update posts p set
  upvotes = (select count(*) from post_votes v where v.post_id = p.id),
  comment_count = (select count(*) from comments c where c.post_id = p.id);
update comments c set
  upvotes = (select count(*) from comment_votes v where v.comment_id = c.id);
update communities co set
  member_count = (select count(*) from community_members m where m.community_id = co.id);

-- ════════════════════════════════════════════════════════════
-- 3. FK cascades so account deletion doesn't error
--    Also repoint the Sprint-1/2 tables (created manually before
--    migration 001 existed) from auth.users to profiles(id) — the
--    wrong target breaks PostgREST embeds like
--    meet_rsvps→profiles (PGRST200), which silently emptied the
--    attendee list. Migration 011 backfilled a profile row for
--    every auth user, so the repoint is safe.
-- ════════════════════════════════════════════════════════════
do $$ begin
  alter table meet_rsvps drop constraint if exists meet_rsvps_user_id_fkey;
  alter table meet_rsvps add constraint meet_rsvps_user_id_fkey
    foreign key (user_id) references profiles(id) on delete cascade;

  alter table meets drop constraint if exists meets_creator_id_fkey;
  alter table meets add constraint meets_creator_id_fkey
    foreign key (creator_id) references profiles(id) on delete cascade;

  alter table garage_cars drop constraint if exists garage_cars_user_id_fkey;
  alter table garage_cars add constraint garage_cars_user_id_fkey
    foreign key (user_id) references profiles(id) on delete cascade;

  alter table albums drop constraint if exists albums_creator_id_fkey;
  alter table albums add constraint albums_creator_id_fkey
    foreign key (creator_id) references profiles(id) on delete cascade;

  alter table follows drop constraint if exists follows_follower_id_fkey;
  alter table follows add constraint follows_follower_id_fkey
    foreign key (follower_id) references profiles(id) on delete cascade;

  alter table follows drop constraint if exists follows_following_id_fkey;
  alter table follows add constraint follows_following_id_fkey
    foreign key (following_id) references profiles(id) on delete cascade;
end $$;

-- ════════════════════════════════════════════════════════════
-- 4. Harden spammable RPCs
-- ════════════════════════════════════════════════════════════
-- notify_on_comment: require an actual recent comment + dedupe window
create or replace function notify_on_comment(p_post_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_author_id uuid;
begin
  select author_id into v_author_id from public.posts where id = p_post_id;
  if v_author_id is null or v_author_id = auth.uid() then return; end if;

  -- Caller must actually have commented on this post in the last minute
  if not exists (
    select 1 from public.comments
    where post_id = p_post_id and author_id = auth.uid()
      and created_at > now() - interval '1 minute'
  ) then return; end if;

  -- Dedupe: at most one comment notification per actor/post/minute
  if exists (
    select 1 from public.notifications
    where user_id = v_author_id and actor_id = auth.uid()
      and type = 'comment' and entity_id = p_post_id
      and created_at > now() - interval '1 minute'
  ) then return; end if;

  insert into public.notifications (user_id, actor_id, type, entity_type, entity_id)
  values (v_author_id, auth.uid(), 'comment', 'post', p_post_id);
end $$;

-- notify_on_follow: add replay dedupe (one follow notification per pair/day)
create or replace function notify_on_follow(target_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() = target_user_id then return; end if;

  if not exists (
    select 1 from public.follows
    where follower_id = auth.uid() and following_id = target_user_id
  ) then
    raise exception 'Follow relationship does not exist';
  end if;

  if exists (
    select 1 from public.notifications
    where user_id = target_user_id and actor_id = auth.uid() and type = 'follow'
      and created_at > now() - interval '1 day'
  ) then return; end if;

  insert into public.notifications (user_id, actor_id, type, entity_type, entity_id)
  values (target_user_id, auth.uid(), 'follow', 'profile', auth.uid());
end $$;

-- emit_feed_event: rate-cap fan-out per actor (10 entities / 5 min) + dedupe
create or replace function emit_feed_event(
  p_event_type text,
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_metadata jsonb default null
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then return; end if;

  if (
    select count(distinct entity_id) from public.feed_events
    where actor_id = auth.uid() and created_at > now() - interval '5 minutes'
  ) >= 10 then return; end if;

  -- Dedupe: don't fan out the same entity twice
  if p_entity_id is not null and exists (
    select 1 from public.feed_events
    where actor_id = auth.uid() and entity_id = p_entity_id and event_type = p_event_type
  ) then return; end if;

  insert into public.feed_events (user_id, actor_id, event_type, entity_type, entity_id, metadata)
  select f.follower_id, auth.uid(), p_event_type, p_entity_type, p_entity_id, p_metadata
  from public.follows f
  where f.following_id = auth.uid();
end $$;

-- increment_build_cost: bound the amount
create or replace function increment_build_cost(log_id uuid, amount integer)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if amount is null or amount < 0 or amount > 10000000 then
    raise exception 'Invalid amount';
  end if;
  if not exists (
    select 1 from public.build_logs
    where id = log_id and owner_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;
  update public.build_logs
  set total_cost = least(coalesce(total_cost, 0) + amount, 2000000000),
      updated_at = now()
  where id = log_id;
end $$;

-- Lock RPC execution to signed-in users only
revoke execute on function notify_on_follow(uuid) from public, anon;
revoke execute on function notify_on_comment(uuid) from public, anon;
revoke execute on function notify_on_build_like(uuid) from public, anon;
revoke execute on function emit_feed_event(text, text, uuid, jsonb) from public, anon;
revoke execute on function increment_build_cost(uuid, integer) from public, anon;
revoke execute on function update_comment_count(uuid) from public, anon;
grant execute on function notify_on_follow(uuid) to authenticated;
grant execute on function notify_on_comment(uuid) to authenticated;
grant execute on function notify_on_build_like(uuid) to authenticated;
grant execute on function emit_feed_event(text, text, uuid, jsonb) to authenticated;
grant execute on function increment_build_cost(uuid, integer) to authenticated;
grant execute on function update_comment_count(uuid) to authenticated;

-- ════════════════════════════════════════════════════════════
-- 5. communities INSERT must bind creator_id
-- ════════════════════════════════════════════════════════════
drop policy if exists "Authenticated users can insert communities" on communities;
create policy "Authenticated users can insert communities"
  on communities for insert with check (auth.uid() = creator_id);

-- ════════════════════════════════════════════════════════════
-- 6. Server-side 10 MB upload limit on all buckets
-- ════════════════════════════════════════════════════════════
update storage.buckets
set file_size_limit = 10485760
where id in ('photos', 'builds', 'posts');

-- ════════════════════════════════════════════════════════════
-- 6b. Enforce meet capacity server-side
--     Client-side isFull checks race: two users on stale pages
--     could both RSVP past max_attendees. The trigger takes a
--     row lock on the meet so concurrent RSVPs serialize.
-- ════════════════════════════════════════════════════════════
create or replace function enforce_meet_capacity()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_max integer;
  v_count integer;
begin
  select max_attendees into v_max
  from public.meets where id = new.meet_id
  for update;  -- serialize concurrent RSVPs to the same meet

  if v_max is not null then
    select count(*) into v_count
    from public.meet_rsvps where meet_id = new.meet_id;
    if v_count >= v_max then
      raise exception 'This meet is full';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists meet_capacity_trg on meet_rsvps;
create trigger meet_capacity_trg
  before insert on meet_rsvps
  for each row execute function enforce_meet_capacity();

-- ════════════════════════════════════════════════════════════
-- 7. Missing FK indexes
-- ════════════════════════════════════════════════════════════
create index if not exists idx_build_logs_owner on build_logs(owner_id);
create index if not exists idx_build_logs_car on build_logs(car_id);
create index if not exists idx_notifications_actor on notifications(actor_id);
create index if not exists idx_feed_events_actor on feed_events(actor_id);
