import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import useForums from "@/hooks/useForums";
import PWButton, { ToggleButton } from "@/components/pitwall/Button";
import { timeAgo } from "@/lib/time";
import type { Community, Post } from "@/types/forum";

type SortKey = "votes" | "replies" | "recency";

export default function CommunityDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, tierLoaded, isPremium } = useAuthContext();
  const navigate = useNavigate();
  const {
    fetchCommunityBySlug,
    fetchPosts,
    deleteCommunity,
    joinCommunity,
    leaveCommunity,
    checkMembership,
    getMemberCount,
    togglePostVote,
    getUserPostVotes,
  } = useForums();

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [memberLoading, setMemberLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [myVotes, setMyVotes] = useState<Set<string>>(new Set());
  const [voteDeltas, setVoteDeltas] = useState<Record<string, number>>({});
  const [sortKey, setSortKey] = useState<SortKey>("recency");

  useEffect(() => {
    if (!slug) return;
    let stale = false;
    setPageLoading(true);
    fetchCommunityBySlug(slug).then((c) => {
      if (stale) return;
      setCommunity(c);
      if (c) {
        Promise.all([fetchPosts(c.id), checkMembership(c.id), getMemberCount(c.id)]).then(
          ([p, membership, count]) => {
            if (stale) return;
            setPosts(p);
            setIsMember(membership);
            setMemberCount(count);
            setPageLoading(false);
          },
        );
      } else {
        setPageLoading(false);
      }
    });
    return () => {
      stale = true;
    };
  }, [slug, fetchCommunityBySlug, fetchPosts, checkMembership, getMemberCount]);

  useEffect(() => {
    if (!user || posts.length === 0) return;
    let stale = false;
    getUserPostVotes(posts.map((p) => p.id)).then((votes) => {
      if (!stale) setMyVotes(votes);
    });
    return () => {
      stale = true;
    };
  }, [user, posts, getUserPostVotes]);

  const handleToggleMembership = useCallback(async () => {
    if (!community) return;
    if (!user) {
      navigate(`/sign-in?redirect=/communities/${slug}`);
      return;
    }
    setMemberLoading(true);
    if (isMember) {
      const ok = await leaveCommunity(community.id);
      if (ok) {
        setIsMember(false);
        setMemberCount((c) => Math.max(0, c - 1));
      }
    } else {
      const ok = await joinCommunity(community.id);
      if (ok) {
        setIsMember(true);
        setMemberCount((c) => c + 1);
      }
    }
    setMemberLoading(false);
  }, [community, user, isMember, joinCommunity, leaveCommunity, navigate, slug]);

  const handleVote = async (post: Post) => {
    if (!user) {
      navigate(`/sign-in?redirect=/communities/${slug}`);
      return;
    }
    const voted = myVotes.has(post.id);
    // Optimistic — flip immediately, revert on error
    setMyVotes((prev) => {
      const next = new Set(prev);
      if (voted) next.delete(post.id);
      else next.add(post.id);
      return next;
    });
    setVoteDeltas((prev) => ({
      ...prev,
      [post.id]: (prev[post.id] ?? 0) + (voted ? -1 : 1),
    }));
    const result = await togglePostVote(post.id);
    if (result === null) {
      setMyVotes((prev) => {
        const next = new Set(prev);
        if (voted) next.add(post.id);
        else next.delete(post.id);
        return next;
      });
      setVoteDeltas((prev) => ({
        ...prev,
        [post.id]: (prev[post.id] ?? 0) + (voted ? 1 : -1),
      }));
    }
  };

  const score = useCallback(
    (p: Post) => p.upvotes + (voteDeltas[p.id] ?? 0),
    [voteDeltas],
  );

  const sortedPosts = useMemo(() => {
    const copy = posts.slice();
    if (sortKey === "votes") copy.sort((a, b) => score(b) - score(a));
    else if (sortKey === "replies") copy.sort((a, b) => b.comment_count - a.comment_count);
    else
      copy.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    return copy;
  }, [posts, sortKey, score]);

  if (pageLoading || (community?.is_premium_only && !isPremium && !tierLoaded)) {
    return (
      <div className="page-enter px-6 py-12 md:px-14">
        <div className="h-14 w-1/2 animate-pulse bg-bg-surface" />
        <div className="mt-8 space-y-px">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse bg-bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="page-enter px-6 pb-20 pt-12 md:px-14">
        <SEOHead title="Community Not Found" description="This community doesn't exist." />
        <h1 className="font-editorial text-[62px] font-normal leading-none text-text-primary">
          Not found
        </h1>
        <p className="mt-4 max-w-[460px] font-editorial text-lg italic text-text-secondary">
          No department at that address.
        </p>
        <Link
          to="/communities"
          className="mt-7 inline-block border-b border-accent pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-text-primary hover:text-accent"
        >
          Back to the departments →
        </Link>
      </div>
    );
  }

  if (community.is_premium_only && tierLoaded && !isPremium) {
    return (
      <div className="page-enter px-6 pb-20 pt-12 md:px-14">
        <SEOHead
          title={`${community.name} — PRO Community`}
          description="This is a PRO-only community."
        />
        <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-accent">
          Pro members only
        </div>
        <h1 className="mt-3 font-editorial text-[62px] font-normal leading-none text-text-primary">
          {community.name}
        </h1>
        <p className="mt-4 max-w-[460px] font-editorial text-lg italic text-text-secondary">
          This room is exclusive to RevD PRO members.
        </p>
        <div className="mt-7">
          <Link to="/premium">
            <PWButton>Go Pro</PWButton>
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = user?.id === community.creator_id;

  return (
    <div className="page-enter pb-[72px]">
      <SEOHead
        title={community.name}
        description={community.description ?? `The ${community.name} department on RevD.`}
      />

      {/* Margin header — the room is editorial */}
      <div className="border-b border-accent px-6 pb-[26px] pt-11 md:px-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.24em] text-text-secondary">
              <Link to="/communities" className="hover:text-accent">
                Departments
              </Link>
              <span className="text-text-muted">/</span>
              <span className="text-accent">r/{community.slug}</span>
            </div>
            <h1 className="mt-3.5 font-editorial text-[40px] font-normal leading-none text-text-primary md:text-[62px]">
              {community.name}
            </h1>
            {community.description && (
              <p className="mt-2.5 font-editorial text-lg italic text-text-secondary">
                {community.description}
              </p>
            )}
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
              {memberCount.toLocaleString()} members · {posts.length} posts
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <ToggleButton
              on={isMember}
              disabled={memberLoading}
              onClick={handleToggleMembership}
              className="px-5 py-[11px]"
            >
              {isMember ? "Joined" : "Join department"}
            </ToggleButton>
            <Link to={user ? `/communities/${slug}/create` : `/sign-in?redirect=/communities/${slug}/create`}>
              <PWButton variant="quiet">New post</PWButton>
            </Link>
            {isCreator &&
              (!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted transition-colors duration-100 hover:text-signal-red"
                >
                  Delete
                </button>
              ) : (
                <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em]">
                  <button
                    disabled={deleting}
                    onClick={async () => {
                      setDeleting(true);
                      const ok = await deleteCommunity(community.id);
                      if (ok) navigate("/communities");
                      else setDeleting(false);
                    }}
                    className="cursor-pointer text-signal-red hover:opacity-80"
                  >
                    {deleting ? "Deleting…" : "Confirm"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="cursor-pointer text-text-secondary hover:text-text-primary"
                  >
                    Keep
                  </button>
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Pit Wall post table — posts are data */}
      <div className="px-6 md:px-14">
        <div className="grid h-9 grid-cols-[108px_1fr_132px] items-center border-b border-border-rule font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary md:grid-cols-[108px_1fr_156px_108px_132px]">
          <button
            onClick={() => setSortKey("votes")}
            className={`cursor-pointer text-left uppercase tracking-[0.2em] transition-colors duration-100 hover:text-accent ${sortKey === "votes" ? "text-accent" : ""}`}
          >
            Votes{sortKey === "votes" ? " ↓" : ""}
          </button>
          <span>Post</span>
          <span className="max-md:hidden">Author</span>
          <button
            onClick={() => setSortKey("replies")}
            className={`cursor-pointer text-left uppercase tracking-[0.2em] transition-colors duration-100 hover:text-accent max-md:hidden ${sortKey === "replies" ? "text-accent" : ""}`}
          >
            Replies{sortKey === "replies" ? " ↓" : ""}
          </button>
          <button
            onClick={() => setSortKey("recency")}
            className={`cursor-pointer text-right uppercase tracking-[0.2em] transition-colors duration-100 hover:text-accent ${sortKey === "recency" ? "text-accent" : ""}`}
          >
            Posted{sortKey === "recency" ? " ↓" : ""}
          </button>
        </div>

        {sortedPosts.length === 0 ? (
          <div className="py-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              No posts in this room yet
            </p>
            <div className="mt-5">
              <Link to={user ? `/communities/${slug}/create` : `/sign-in?redirect=/communities/${slug}/create`}>
                <PWButton variant="secondary">Start the first thread</PWButton>
              </Link>
            </div>
          </div>
        ) : (
          sortedPosts.map((post) => {
            const voted = myVotes.has(post.id);
            return (
              <div
                key={post.id}
                onClick={() => navigate(`/communities/${slug}/post/${post.id}`)}
                className="grid min-h-[58px] cursor-pointer grid-cols-[108px_1fr_132px] items-center border-b border-border-hair transition-colors duration-100 hover:bg-bg-elevated md:grid-cols-[108px_1fr_156px_108px_132px]"
              >
                <span onClick={(e) => e.stopPropagation()}>
                  <span className="flex w-max items-center gap-2 border border-border-rule">
                    <button
                      onClick={() => handleVote(post)}
                      aria-pressed={voted}
                      aria-label={voted ? "Remove upvote" : "Upvote"}
                      className={`cursor-pointer px-2 py-[5px] font-mono text-[10px] transition-colors duration-100 hover:text-accent ${
                        voted ? "text-accent" : "text-text-muted"
                      }`}
                    >
                      ▲
                    </button>
                    <span className="min-w-6 pr-2 text-center font-mono text-xs font-semibold text-text-primary">
                      {score(post)}
                    </span>
                  </span>
                </span>
                <span className="truncate pr-7 text-base font-semibold tracking-[-0.015em] text-text-primary">
                  {post.title}
                </span>
                <span className="truncate font-mono text-[11px] text-text-secondary max-md:hidden">
                  {post.author?.display_name ?? "Anonymous"}
                </span>
                <span className="font-mono text-[13px] text-text-primary max-md:hidden">
                  {post.comment_count}
                </span>
                <span className="text-right font-mono text-[11px] text-text-secondary">
                  {timeAgo(post.created_at)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
