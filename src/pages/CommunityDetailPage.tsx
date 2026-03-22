import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";
import useForums from "@/hooks/useForums";
import type { Community, Post } from "@/types/forum";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function PostCard({ post, slug }: { post: Post; slug: string }) {
  const authorName = post.author?.display_name ?? "Anonymous";
  const authorInitial = authorName[0]?.toUpperCase() ?? "?";

  return (
    <Link
      to={`/communities/${slug}/post/${post.id}`}
      className="group block rounded-xl border border-white/10 bg-bg-surface p-5 transition-all duration-300 hover:border-accent-red/30 hover:shadow-lg hover:shadow-accent-red/5"
    >
      <div className="flex gap-4">
        {/* Upvote column */}
        <div className="flex flex-col items-center gap-1 pt-0.5">
          <svg
            className="h-4 w-4 text-text-muted group-hover:text-accent-red transition-colors"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
          <span className="font-mono text-sm font-bold text-text-primary">{post.upvotes}</span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3 className="font-body text-base font-semibold text-text-primary leading-snug group-hover:text-accent-red transition-colors">
            {post.title}
          </h3>

          {post.body && (
            <p className="mt-1.5 font-body text-sm text-text-secondary line-clamp-2 leading-relaxed">
              {post.body}
            </p>
          )}

          {post.image_url && (
            <div className="mt-3 aspect-[16/9] overflow-hidden rounded-lg">
              <img
                src={post.image_url}
                alt={post.title}
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Meta */}
          <div className="mt-3 flex items-center gap-3">
            {/* Author */}
            <div className="flex items-center gap-1.5">
              {post.author?.avatar_url ? (
                <img
                  src={post.author.avatar_url}
                  alt={authorName}
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-red/20">
                  <span className="font-body text-[9px] font-bold text-accent-red">
                    {authorInitial}
                  </span>
                </div>
              )}
              <span className="font-body text-xs text-text-muted">{authorName}</span>
            </div>

            <span className="text-text-muted">·</span>
            <span className="font-body text-xs text-text-muted">{timeAgo(post.created_at)}</span>

            <span className="text-text-muted">·</span>
            <div className="flex items-center gap-1">
              <svg
                className="h-3.5 w-3.5 text-text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="font-body text-xs text-text-muted">{post.comment_count}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CommunityDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { loading, fetchCommunityBySlug, fetchPosts, deleteCommunity, joinCommunity, leaveCommunity, checkMembership, getMemberCount } = useForums();

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [memberLoading, setMemberLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setPageLoading(true);
    fetchCommunityBySlug(slug).then((c) => {
      setCommunity(c);
      if (c) {
        Promise.all([
          fetchPosts(c.id),
          checkMembership(c.id),
          getMemberCount(c.id),
        ]).then(([p, membership, count]) => {
          setPosts(p);
          setIsMember(membership);
          setMemberCount(count);
          setPageLoading(false);
        });
      } else {
        setPageLoading(false);
      }
    });
  }, [slug, fetchCommunityBySlug, fetchPosts, checkMembership, getMemberCount]);

  const handleToggleMembership = useCallback(async () => {
    if (!community || !user) return;
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
  }, [community, user, isMember, joinCommunity, leaveCommunity]);

  if (pageLoading) {
    return (
      <div className="page-enter">
        <div className="h-48 animate-pulse bg-bg-surface" />
        <PageWrapper>
          <div className="space-y-4 py-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-bg-surface" />
            ))}
          </div>
        </PageWrapper>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="page-enter">
        <SEOHead title="Community Not Found" description="This community doesn't exist." />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="font-mono text-6xl font-black text-text-muted">404</div>
          <h1 className="font-display mt-4 text-2xl uppercase tracking-wide text-text-primary">
            Community not found
          </h1>
          <Link
            to="/communities"
            className="mt-6 rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
          >
            Browse Communities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <SEOHead
        title={`${community.name} — Community on RevD`}
        description={community.description ?? `Join the ${community.name} community on RevD.`}
      />

      {/* Community Header */}
      <div className="border-b border-border bg-bg-surface/50">
        {community.banner_image && (
          <div className="h-40 w-full overflow-hidden sm:h-52">
            <img
              src={community.banner_image}
              alt={`${community.name} banner`}
              className="h-full w-full object-cover"
              loading="eager"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}
        <PageWrapper>
          <div className="py-8 sm:py-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-bg-elevated border border-white/5 text-3xl">
                  {community.icon || "💬"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/communities"
                      className="font-body text-xs text-text-muted hover:text-text-secondary transition-colors"
                    >
                      Communities
                    </Link>
                    <span className="text-text-muted">/</span>
                  </div>
                  <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-text-primary leading-none">
                    {community.name}
                  </h1>
                  {community.description && (
                    <p className="font-body mt-2 max-w-2xl text-sm text-text-secondary leading-relaxed">
                      {community.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-text-muted">
                      {memberCount} {memberCount === 1 ? "member" : "members"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {user ? (
                  <button
                    onClick={handleToggleMembership}
                    disabled={memberLoading}
                    className={`inline-flex items-center gap-2 rounded-lg px-5 py-3 font-body text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 ${
                      isMember
                        ? "border-2 border-accent-red text-accent-red hover:bg-accent-red/10"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {isMember ? (
                        <path d="M20 6 9 17l-5-5" />
                      ) : (
                        <>
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <line x1="19" x2="19" y1="8" y2="14" />
                          <line x1="22" x2="16" y1="11" y2="11" />
                        </>
                      )}
                    </svg>
                    {memberLoading ? "..." : isMember ? "Joined" : "Join"}
                  </button>
                ) : (
                  <Link
                    to={`/sign-in?redirect=/communities/${slug}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-5 py-3 font-body text-sm font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-colors"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" x2="19" y1="8" y2="14" />
                      <line x1="22" x2="16" y1="11" y2="11" />
                    </svg>
                    Join
                  </Link>
                )}

                {user && (
                  <Link
                    to={`/communities/${slug}/create`}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-5 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                    </svg>
                    New Post
                  </Link>
                )}
              </div>
            </div>
          </div>
        </PageWrapper>
      </div>

      {/* Posts Feed */}
      <PageWrapper>
        <div className="py-8">
          {posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} slug={community.slug} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-bg-surface border border-border">
                <svg
                  className="h-10 w-10 text-text-muted"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                  />
                </svg>
              </div>
              <h2 className="font-display text-2xl uppercase tracking-wide text-text-primary mb-2">
                No Posts Yet
              </h2>
              <p className="font-body text-sm text-text-secondary max-w-md mb-6">
                Be the first to start a conversation in {community.name}.
              </p>
              {user ? (
                <Link
                  to={`/communities/${slug}/create`}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
                >
                  Create the First Post
                </Link>
              ) : (
                <Link
                  to={`/sign-in?redirect=/communities/${slug}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
                >
                  Sign In to Post
                </Link>
              )}
            </div>
          )}

          {/* Delete community — only for creator */}
          {user && community.creator_id === user.id && (
            <div className="mt-12 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="font-body text-xs font-bold uppercase tracking-wider text-red-400 mb-1">
                Danger Zone
              </p>
              <p className="font-body text-sm text-text-secondary mb-3">
                Deleting this community will remove all posts, comments, and members permanently.
              </p>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 font-body text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Community
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="font-body text-xs text-red-400">Delete permanently?</span>
                  <button
                    onClick={async () => {
                      setDeleting(true);
                      const ok = await deleteCommunity(community.id);
                      if (ok) {
                        navigate("/communities");
                      } else {
                        setDeleting(false);
                        setConfirmDelete(false);
                      }
                    }}
                    disabled={deleting}
                    className="font-body text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {deleting ? "Deleting..." : "Yes, delete"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="font-body text-xs text-text-muted hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}
