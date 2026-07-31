import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import useForums from "@/hooks/useForums";
import PWButton from "@/components/pitwall/Button";
import { TextareaField } from "@/components/pitwall/Field";
import { timeAgo } from "@/lib/time";
import type { Community, Post, Comment } from "@/types/forum";

export default function PostDetailPage() {
  const { slug, postId } = useParams<{ slug: string; postId: string }>();
  const { user, tierLoaded, isPremium } = useAuthContext();
  const navigate = useNavigate();
  const {
    fetchCommunityBySlug,
    fetchPost,
    deletePost,
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
  const [commentVoteOffsets, setCommentVoteOffsets] = useState<Record<string, number>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const postVoteInFlight = useRef(false);
  const commentVotesInFlight = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!slug || !postId) return;
    let stale = false;
    setPageLoading(true);
    Promise.all([
      fetchCommunityBySlug(slug),
      fetchPost(postId),
      fetchComments(postId),
    ]).then(([c, p, cmts]) => {
      if (stale) return;
      setCommunity(c);
      setPost(p);
      setComments(cmts);
      setPageLoading(false);
    });
    return () => {
      stale = true;
    };
  }, [slug, postId, fetchCommunityBySlug, fetchPost, fetchComments]);

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
    if (!postId || postVoteInFlight.current) return;
    if (!user) {
      navigate(`/sign-in?redirect=/communities/${slug}/post/${postId}`);
      return;
    }
    postVoteInFlight.current = true;
    try {
      const result = await togglePostVote(postId);
      if (result === true) {
        setHasVotedPost(true);
        setLocalUpvoteOffset((p) => p + 1);
      } else if (result === false) {
        setHasVotedPost(false);
        setLocalUpvoteOffset((p) => p - 1);
      }
    } finally {
      postVoteInFlight.current = false;
    }
  }, [user, postId, togglePostVote, navigate, slug]);

  const handleCommentVote = useCallback(
    async (commentId: string) => {
      if (!user || commentVotesInFlight.current.has(commentId)) return;
      commentVotesInFlight.current.add(commentId);
      try {
        const result = await toggleCommentVote(commentId);
        if (result === true) {
          setVotedComments((prev) => new Set([...prev, commentId]));
          setCommentVoteOffsets((prev) => ({
            ...prev,
            [commentId]: (prev[commentId] ?? 0) + 1,
          }));
        } else if (result === false) {
          setVotedComments((prev) => {
            const next = new Set(prev);
            next.delete(commentId);
            return next;
          });
          setCommentVoteOffsets((prev) => ({
            ...prev,
            [commentId]: (prev[commentId] ?? 0) - 1,
          }));
        }
      } finally {
        commentVotesInFlight.current.delete(commentId);
      }
    },
    [user, toggleCommentVote],
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

  if (pageLoading || (community?.is_premium_only && !isPremium && !tierLoaded)) {
    return (
      <div className="page-enter px-6 py-12 md:px-14">
        <div className="mx-auto max-w-[700px] space-y-5">
          <div className="h-10 w-2/3 animate-pulse bg-bg-surface" />
          <div className="h-48 animate-pulse bg-bg-surface" />
        </div>
      </div>
    );
  }

  if (community?.is_premium_only && tierLoaded && !isPremium) {
    return (
      <div className="page-enter px-6 pb-20 pt-12 md:px-14">
        <SEOHead
          title={`${community.name} — PRO Community`}
          description="This post is in a PRO-only community."
        />
        <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-accent">
          Pro members only
        </div>
        <h1 className="mt-3 font-editorial text-[54px] font-normal leading-none text-text-primary">
          {community.name}
        </h1>
        <p className="mt-4 max-w-[460px] font-editorial text-lg italic text-text-secondary">
          This thread lives in a premium room.
        </p>
        <div className="mt-7">
          <Link to="/premium">
            <PWButton>Go Pro</PWButton>
          </Link>
        </div>
      </div>
    );
  }

  if (!post || !community) {
    return (
      <div className="page-enter px-6 pb-20 pt-12 md:px-14">
        <SEOHead title="Post Not Found" description="This post doesn't exist." />
        <h1 className="font-editorial text-[62px] font-normal leading-none text-text-primary">
          Not found
        </h1>
        <p className="mt-4 max-w-[460px] font-editorial text-lg italic text-text-secondary">
          This thread may have been removed, or the link is wrong.
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

  const isAuthor = user?.id === post.author_id;
  const postScore = post.upvotes + localUpvoteOffset;

  return (
    <div className="page-enter grid gap-11 px-6 pb-20 pt-12 md:px-14 lg:grid-cols-[200px_1fr_200px]">
      <SEOHead
        title={post.title}
        description={post.body?.slice(0, 160) ?? `A discussion in ${community.name} on RevD.`}
      />

      {/* Left margin */}
      <div className="font-mono text-[9px] uppercase leading-[2.2] tracking-[0.2em] text-text-muted max-lg:hidden">
        r/{community.slug}
        <br />
        Discussion
        <br />
        {comments.length} {comments.length === 1 ? "reply" : "replies"}
      </div>

      {/* Measure — serif headline over a Pit Wall thread */}
      <div className="mx-auto w-full max-w-[700px]">
        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.24em] text-accent">
          <Link to="/communities" className="hover:text-accent-hover">
            Departments
          </Link>
          <span className="text-text-muted">/</span>
          <Link to={`/communities/${community.slug}`} className="hover:text-accent-hover">
            {community.name}
          </Link>
        </div>

        <div className="mt-4 flex items-start gap-6">
          {/* Post vote cluster — this schema is upvote-only */}
          <div className="flex shrink-0 flex-col items-center gap-1 border border-border-rule px-1 py-1.5">
            <button
              onClick={handlePostVote}
              aria-pressed={hasVotedPost}
              aria-label={hasVotedPost ? "Remove upvote" : "Upvote"}
              className={`cursor-pointer px-2 py-0.5 text-xs transition-colors duration-100 hover:text-accent ${
                hasVotedPost ? "text-accent" : "text-text-muted"
              }`}
            >
              ▲
            </button>
            <span className="font-mono text-sm font-semibold text-text-primary">
              {postScore}
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="font-editorial text-[30px] font-normal leading-[1.08] text-text-primary md:text-[44px]">
              {post.title}
            </h1>
            <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary">
              {post.author?.display_name ?? "Anonymous"} · {timeAgo(post.created_at)} ·{" "}
              {comments.length} {comments.length === 1 ? "reply" : "replies"}
            </p>
          </div>
        </div>

        {post.body && (
          <p
            className="mt-6 whitespace-pre-line text-[17px] leading-[1.75] text-text-primary"
            style={{ textWrap: "pretty" }}
          >
            {post.body}
          </p>
        )}
        {post.image_url && (
          <img
            src={post.image_url}
            alt=""
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
            className="mt-6 block max-h-[520px] w-full object-cover"
          />
        )}

        {isAuthor && (
          <div className="mt-5">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted transition-colors duration-100 hover:text-signal-red"
              >
                Delete post
              </button>
            ) : (
              <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em]">
                <span className="text-text-muted">Sure?</span>
                <button
                  disabled={deleting}
                  onClick={async () => {
                    setDeleting(true);
                    const ok = await deletePost(post.id);
                    if (ok) navigate(`/communities/${community.slug}`);
                    else setDeleting(false);
                  }}
                  className="cursor-pointer text-signal-red hover:opacity-80"
                >
                  {deleting ? "Deleting…" : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="cursor-pointer text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
              </span>
            )}
          </div>
        )}

        {/* The thread — Pit Wall from here down */}
        <div className="mt-[34px] border-t border-accent">
          <div className="flex items-center justify-between py-3.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-text-secondary">
              Thread
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">
              Oldest first
            </span>
          </div>

          {comments.length === 0 && (
            <p className="border-t border-border-hair py-5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              Nobody has replied yet
            </p>
          )}
          {comments.map((comment) => {
            const voted = votedComments.has(comment.id);
            const count = comment.upvotes + (commentVoteOffsets[comment.id] ?? 0);
            return (
              <div
                key={comment.id}
                className="grid grid-cols-[96px_1fr] gap-4 border-t border-border-hair py-4 transition-colors duration-100 hover:bg-bg-elevated"
              >
                <span className="flex h-[26px] items-center gap-1.5">
                  <button
                    onClick={() => handleCommentVote(comment.id)}
                    aria-pressed={voted}
                    aria-label={voted ? "Remove upvote" : "Upvote reply"}
                    className={`cursor-pointer px-1 font-mono text-[10px] transition-colors duration-100 hover:text-accent ${
                      voted ? "text-accent" : "text-text-muted"
                    }`}
                  >
                    ▲
                  </button>
                  <span className="min-w-[22px] text-center font-mono text-xs font-semibold text-text-primary">
                    {count}
                  </span>
                </span>
                <span className="flex min-w-0 flex-col gap-[5px]">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary">
                    {comment.author?.display_name ?? "Anonymous"} ·{" "}
                    {timeAgo(comment.created_at)}
                  </span>
                  <span className="whitespace-pre-line text-[15px] leading-[1.65] text-text-primary">
                    {comment.body}
                  </span>
                </span>
              </div>
            );
          })}

          {/* Reply box — a form is a form */}
          <div className="mt-2 border-t border-border-rule pt-[22px]">
            <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.24em] text-text-secondary">
              Reply
            </div>
            {user ? (
              <form onSubmit={handleSubmitComment}>
                <TextareaField
                  label=""
                  value={commentBody}
                  maxLength={10000}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Add to the thread"
                  rows={3}
                />
                <PWButton
                  type="submit"
                  disabled={submitting || !commentBody.trim()}
                  className="mt-3"
                >
                  {submitting ? "Posting…" : "Post reply"}
                </PWButton>
              </form>
            ) : (
              <Link to={`/sign-in?redirect=/communities/${slug}/post/${postId}`}>
                <PWButton variant="secondary">Sign in to reply</PWButton>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Right margin */}
      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted max-lg:hidden lg:text-right lg:leading-[2.2]">
        <Link
          to={`/communities/${community.slug}`}
          className="transition-colors duration-100 hover:text-accent"
        >
          The room
        </Link>
        <br />
        <Link to="/communities" className="transition-colors duration-100 hover:text-accent">
          All departments
        </Link>
      </div>
    </div>
  );
}
