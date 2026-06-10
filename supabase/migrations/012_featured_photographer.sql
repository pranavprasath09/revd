-- Sprint 8: Featured Photographer
-- ─────────────────────────────────────────────
-- Algorithmic pick: the most-followed profile that has at least one public
-- album, ties broken by most recent album. Computed server-side in one RPC so
-- the photos page needs a single round trip and no client-side ranking.
--
-- Runs with caller rights (no SECURITY DEFINER needed): albums, follows, and
-- profiles are all publicly readable, so anonymous visitors get results too.
-- Idempotent: create or replace + grant are safe to re-run.

create or replace function public.get_featured_photographer()
returns table (
  profile_id uuid,
  display_name text,
  avatar_url text,
  bio text,
  follower_count bigint,
  album_count bigint,
  recent_covers text[]
)
language sql
stable
set search_path = public
as $$
  with photographers as (
    select
      a.creator_id,
      count(*) as album_count,
      max(a.created_at) as latest_album
    from albums a
    where a.is_public = true
    group by a.creator_id
  ),
  ranked as (
    select
      p.creator_id,
      p.album_count,
      p.latest_album,
      (select count(*) from follows f where f.following_id = p.creator_id) as follower_count
    from photographers p
    order by follower_count desc, latest_album desc
    limit 1
  )
  select
    pr.id,
    pr.display_name,
    pr.avatar_url,
    pr.bio,
    r.follower_count,
    r.album_count,
    coalesce(
      (
        select array_agg(c.cover)
        from (
          select a.cover_image as cover
          from albums a
          where a.creator_id = r.creator_id
            and a.is_public = true
            and a.cover_image is not null
          order by a.created_at desc
          limit 3
        ) c
      ),
      '{}'
    ) as recent_covers
  from ranked r
  join profiles pr on pr.id = r.creator_id;
$$;

grant execute on function public.get_featured_photographer() to anon, authenticated;
