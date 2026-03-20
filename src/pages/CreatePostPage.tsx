import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";
import useForums from "@/hooks/useForums";
import { supabase } from "@/lib/supabase";
import type { Community } from "@/types/forum";

export default function CreatePostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { fetchCommunityBySlug, createPost } = useForums();

  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchCommunityBySlug(slug).then((c) => {
      setCommunity(c);
      setLoading(false);
    });
  }, [slug, fetchCommunityBySlug]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!community || !user || !title.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      let imageUrl: string | undefined;

      // Upload image if provided
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(path, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("posts")
          .getPublicUrl(path);

        imageUrl = urlData.publicUrl;
      }

      const post = await createPost({
        community_id: community.id,
        title: title.trim(),
        body: body.trim() || undefined,
        image_url: imageUrl,
      });

      if (post) {
        navigate(`/communities/${slug}/post/${post.id}`);
      } else {
        setError("Failed to create post. Please try again.");
      }
    } catch (err) {
      console.error("Failed to create post:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Auth gate
  if (!user) {
    return (
      <div className="page-enter">
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <h1 className="font-display text-2xl uppercase tracking-wide text-text-primary mb-4">
            Sign In Required
          </h1>
          <p className="font-body text-sm text-text-secondary mb-6">
            You need to be signed in to create a post.
          </p>
          <Link
            to={`/sign-in?redirect=/communities/${slug}/create`}
            className="rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-enter">
        <PageWrapper>
          <div className="py-12 space-y-4">
            <div className="h-8 w-1/3 animate-pulse rounded-lg bg-bg-surface" />
            <div className="h-64 animate-pulse rounded-xl bg-bg-surface" />
          </div>
        </PageWrapper>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="page-enter">
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
        title={`New Post — ${community.name}`}
        description={`Create a new post in the ${community.name} community.`}
      />

      {/* Header */}
      <div className="border-b border-border bg-bg-surface/50">
        <PageWrapper>
          <div className="py-8 sm:py-10">
            <div className="flex items-center gap-2 mb-3">
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
              <span className="text-text-muted">/</span>
              <span className="font-body text-xs text-text-secondary">New Post</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-text-primary leading-none">
              Create a Post
            </h1>
          </div>
        </PageWrapper>
      </div>

      {/* Form */}
      <PageWrapper>
        <div className="py-8 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 block">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                required
                className="w-full rounded-xl border border-white/10 bg-bg-surface px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted focus:border-accent-red/50 focus:outline-none transition-colors"
              />
            </div>

            {/* Body */}
            <div>
              <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 block">
                Body <span className="text-text-muted">(optional)</span>
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share more details..."
                rows={6}
                className="w-full resize-none rounded-xl border border-white/10 bg-bg-surface px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted focus:border-accent-red/50 focus:outline-none transition-colors"
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 block">
                Image <span className="text-text-muted">(optional)</span>
              </label>

              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-white/10">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-64 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-bg-base/80 text-white backdrop-blur-sm hover:bg-bg-base transition-colors cursor-pointer"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-bg-surface py-8 transition-colors hover:border-accent-red/30">
                  <svg
                    className="h-8 w-8 text-text-muted mb-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                    />
                  </svg>
                  <span className="font-body text-sm text-text-muted">Click to upload an image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                <p className="font-body text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!title.trim() || submitting}
                className="rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? "Posting..." : "Post"}
              </button>
              <Link
                to={`/communities/${slug}`}
                className="rounded-lg border border-white/10 px-6 py-3 font-body text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-surface"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </PageWrapper>
    </div>
  );
}
