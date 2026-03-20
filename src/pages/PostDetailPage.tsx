import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";
import useForums from "@/hooks/useForums";
import type { Community, Post, Comment } from "@/types/forum";

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

function CommentItem({
  comment,
  hasVoted,
  onVote,
}: {
  comment: Comment;
  hasVoted: boolean;
  onVote: (id: string) => void;
}) {
  const authorName = comment.author?.display_name ?? "Anonymous";
  const authorInitial = authorName[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex gap-3 py-4 border-b border-white/5 last:border-0">
      {/* Avatar */}
      {comment.author?.avatar_url ? (
        <img
          src={comment.author.avatar_url}
          alt=""
          className="h-8 w-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-red/20">
          <span className="font-body text-xs font-bold text-accent-red">{authorInitial}</span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-body text-sm font-semibold text-text-primary">{authorName}</span>
          <span className="font-body text-xs text-text-muted">{timeAgo(comment.created_at)}</span>
        </div>
        <p className="mt-1 font-body text-sm text-text-secondary leading-relaxed whitespace-pre-line">
          {comment.body}
        </p>
        <button
          onClick={() => onVote(comment.id)}
          className={`mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 font-body text-xs transition-colors cursor-pointer ${
            hasVoted
              ? "text-accent-red bg-accent-red/10"
              : "text-text-muted hover:text-text-secondary hover:bg-white/5"
          }`}
        >
          <svg
            className="h-3 w-3"
            viewBox="0 0 24 24"
            fill={hasVoted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
          {comment.upvotes + (hasVoted ? 1 : 0)}
        </button>
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const { slug, postId } = useParams<{ slug: string; postId: string }>();
  const { user } = useAuthContext();
  const {
    fetchCommunityBySlug,
    fetchPost,
    fetchComments,
    createComment,
    togglePostVote,
    toggleCommentVote,
    getUserPostVotes,
    getUserCommentVotes,
  } = useForums();

  const [community, setCommunity] = useState<Community | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [commentBody, setCommentBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasVotedPost, setHasVotedPost] = useState(false);
  const [votedComments, setVotedComments] = useState<Set<string>>(new Set());
  const [localUpvoteOffset, setLocalUpvoteOffset] = useState(0);

  // Load everything
  useEffect(() => {
    if (!slug || !postId) return;
    setPageLoading(true);

    Promise.all([
      fetchCommunityBySlug(slug),
      fetchPost(postId),
      fetchComments(postId),
    ]).then(([c, p, cmts]) => {
      setCommunity(c);
      setPost(p);
      setComments(cmts);
      setPageLoading(false);
    });
  }, [slug, postId, fetchCommunityBySlug, fetchPost, fetchComments]);

  // Load user votes
  useEffect(() => {
    if (!postId || !user) return;
    getUserPostVotes([postId]).then((votes) => {
      setHasVotedPost(votes.has(postId));
    });
  }, [postId, user, getUserPostVotes]);

  useEffect(() => {
    if (comments.length === 0 || !user) return;
    getUserCommentVotes(comments.map((c) => c.id)).then(setVotedComments);
  }, [comments, user, getUserCommentVotes]);

  const handlePostVote = useCallback(async () => {
    if (!user || !postId) return;
    const result = await togglePostVote(postId);
    if (result === true) {
      setHasVotedPost(true);
      setLocalUpvoteOffset((p) => p + 1);
    } else if (result === false) {
      setHasVotedPost(false);
      setLocalUpvoteOffset((p) => p - 1);
    }
  }, [user, postId, togglePostVote]);

  const handleCommentVote = useCallback(
    async (commentId: string) => {
      if (!user) return;
      const result = await toggleCommentVote(commentId);
      if (result === true) {
        setVotedComments((prev) => new Set([...prev, commentId]));
      } else if (result === false) {
        setVotedComments((prev) => {
          const next = new Set(prev);
          next.delete(commentId);
          return next;
        });
      }
    },
    [user, toggleCommentVote]
  );

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim() || !postId) return;
    setSubmitting(true);
    const newComment = await createComment(postId, commentBody.trim());
    if (newComment) {
      setComments((prev) => [...prev, newComment]);
      setCommentBody("");
    }
    setSubmitting(false);
  };

  if (pageLoading) {
    return (
      <div className="page-enter">
        <PageWrapper>
          <div className="space-y-4 py-12">
            <div className="h-8 w-2/3 animate-pulse rounded-lg bg-bg-surface" />
            <div className="h-48 w-full animate-pulse rounded-lg bg-bg-surface" />
            <div className="h-32 w-full animate-pulse rounded-lg bg-bg-surface" />
          </div>
        </PageWrapper>
      </div>
    );
  }

  if (!post || !community) {
    return (
      <div className="page-enter">
        <SEOHead title="Post Not Found" description="This post doesn't exist." />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="font-mono text-6xl font-black text-text-muted">404</div>
          <h1 className="font-display mt-4 text-2xl uppercase tracking-wide text-text-primary">
            Post not found
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

  const authorName = post.author?.display_name ?? "Anonymous";
  const authorInitial = authorName[0]?.toUpperCase() ?? "?";

  return (
    <div className="page-enter">
      <SEOHead
        title={`${post.title} — ${community.name}`}
        description={post.body?.slice(0, 160) ?? `Post in ${community.name} community on RevD.`}
      />

      <PageWrapper>
        <div className="py-8 max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Link
              to="/communities"
              className="font-body text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Communities
            </Link>
            <span className="text-text-muted">/</span>
            <Link
              to={`/communities/${slug}`}
              className="font-body text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              {community.name}
            </Link>
          </div>

          {/* Post */}
          <article className="rounded-xl border border-white/10 bg-bg-surface p-6 sm:p-8">
            <div className="flex gap-4">
              {/* Vote column */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={handlePostVote}
                  disabled={!user}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors cursor-pointer disabled:cursor-default ${
                    hasVotedPost
                      ? "bg-accent-red/10 text-accent-red"
                      : "text-text-muted hover:bg-white/5 hover:text-text-secondary"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill={hasVotedPost ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m18 15-6-6-6 6" />
                  </svg>
                </button>
                <span className="font-mono text-lg font-bold text-text-primary">
                  {post.upvotes + localUpvoteOffset}
                </span>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-text-primary leading-tight">
                  {post.title}
                </h1>

                {/* Author info */}
                <div className="mt-3 flex items-center gap-2">
                  {post.author?.avatar_url ? (
                    <img
                      src={post.author.avatar_url}
                      alt=""
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-red/20">
                      <span className="font-body text-[10px] font-bold text-accent-red">
                        {authorInitial}
                      </span>
                    </div>
                  )}
                  <span className="font-body text-sm text-text-secondary">{authorName}</span>
                  <span className="text-text-muted">·</span>
                  <span className="font-body text-sm text-text-muted">
                    {timeAgo(post.created_at)}
                  </span>
                </div>

                {/* Body */}
                {post.body && (
                  <div className="mt-5">
                    <p className="font-body text-base text-text-secondary leading-relaxed whitespace-pre-line">
                      {post.body}
                    </p>
                  </div>
                )}

                {/* Image */}
                {post.image_url && (
                  <div className="mt-5 overflow-hidden rounded-lg">
                    <img
                      src={post.image_url}
                      alt=""
                      loading="lazy"
                      className="w-full object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </article>

          {/* Comments Section */}
          <section className="mt-6">
            <h2 className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-4">
              Comments ({comments.length})
            </h2>

            {/* Comment form */}
            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <div className="rounded-xl border border-white/10 bg-bg-surface overflow-hidden">
                  <textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full resize-none bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                  />
                  <div className="flex justify-end border-t border-white/5 px-4 py-2">
                    <button
                      type="submit"
                      disabled={!commentBody.trim() || submitting}
                      className="rounded-lg bg-accent-red px-4 py-2 font-body text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {submitting ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-6 rounded-xl border border-white/10 bg-bg-surface p-4 text-center">
                <Link
                  to={`/sign-in?redirect=/communities/${slug}/post/${postId}`}
                  className="font-body text-sm text-accent-red hover:text-accent-hover transition-colors"
                >
                  Sign in to comment
                </Link>
              </div>
            )}

            {/* Comments list */}
            {comments.length > 0 ? (
              <div className="rounded-xl border border-white/10 bg-bg-surface px-5">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    hasVoted={votedComments.has(comment.id)}
                    onVote={handleCommentVote}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-bg-surface p-8 text-center">
                <p className="font-body text-sm text-text-muted">
                  No comments yet. Be the first to share your thoughts.
                </p>
              </div>
            )}
          </section>
        </div>
      </PageWrapper>
    </div>
  );
}
