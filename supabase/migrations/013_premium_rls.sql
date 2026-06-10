-- Migration 013: Enforce premium community gating at the database level
-- ─────────────────────────────────────────────────────────────────────
-- Why: is_premium_only communities were gated only in React
-- (CommunityDetailPage). The posts/comments tables had `using (true)` select
-- policies, so any anonymous visitor could read premium content straight from
-- the PostgREST endpoint with the public anon key, and free users could write
-- posts into premium communities. RLS now enforces what the UI promises; the
-- client gate becomes UX-only.
--
-- Rules: content in a premium community is visible to premium users and to
-- the row's own author (so nobody loses access to their own words). Writes
-- into premium communities require premium.
-- Idempotent: drop policy if exists before every create.

-- ── POSTS ────────────────────────────────────────────────────────────

drop policy if exists "Posts are viewable by everyone" on posts;
drop policy if exists "Posts respect premium communities" on posts;
create policy "Posts respect premium communities"
  on posts for select using (
    not exists (
      select 1 from communities c
      where c.id = posts.community_id and c.is_premium_only
    )
    or auth.uid() = author_id
    or exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.is_premium
    )
  );

drop policy if exists "Authenticated users can create posts" on posts;
create policy "Authenticated users can create posts"
  on posts for insert with check (
    auth.uid() = author_id
    and (
      not exists (
        select 1 from communities c
        where c.id = posts.community_id and c.is_premium_only
      )
      or exists (
        select 1 from profiles p
        where p.id = auth.uid() and p.is_premium
      )
    )
  );

-- ── COMMENTS ─────────────────────────────────────────────────────────

drop policy if exists "Comments are viewable by everyone" on comments;
drop policy if exists "Comments respect premium communities" on comments;
create policy "Comments respect premium communities"
  on comments for select using (
    not exists (
      select 1 from posts po
      join communities c on c.id = po.community_id
      where po.id = comments.post_id and c.is_premium_only
    )
    or auth.uid() = author_id
    or exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.is_premium
    )
  );

drop policy if exists "Authenticated users can create comments" on comments;
create policy "Authenticated users can create comments"
  on comments for insert with check (
    auth.uid() = author_id
    and (
      not exists (
        select 1 from posts po
        join communities c on c.id = po.community_id
        where po.id = comments.post_id and c.is_premium_only
      )
      or exists (
        select 1 from profiles p
        where p.id = auth.uid() and p.is_premium
      )
    )
  );
