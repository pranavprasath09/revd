import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";
import useForums from "@/hooks/useForums";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export default function CreateCommunityPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { createCommunity } = useForums();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);

    const slug = slugify(name);
    if (!slug) {
      setError("Name must contain at least one letter or number.");
      setSubmitting(false);
      return;
    }

    try {
      const community = await createCommunity({
        name: name.trim(),
        slug,
        description: description.trim() || undefined,
      });
      navigate(`/communities/${community.slug}`);
    } catch (err: any) {
      const msg = err?.message || "Something went wrong.";
      if (msg.includes("duplicate") || msg.includes("unique")) {
        setError("A community with that name already exists. Try a different name.");
      } else {
        setError(msg);
      }
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="page-enter">
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <h1 className="font-display text-2xl uppercase tracking-wide text-text-primary mb-4">
            Sign In Required
          </h1>
          <p className="font-body text-sm text-text-secondary mb-6">
            You need to be signed in to create a community.
          </p>
          <Link
            to="/sign-in?redirect=/communities/create"
            className="rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <SEOHead
        title="Create a Community"
        description="Start a new car community on RevD."
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
              <span className="font-body text-xs text-text-secondary">New Community</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-text-primary leading-none">
              Create a Community
            </h1>
          </div>
        </PageWrapper>
      </div>

      {/* Form */}
      <PageWrapper>
        <div className="py-8 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 block">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rotary Enthusiasts"
                required
                className="w-full rounded-xl border border-white/10 bg-bg-surface px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted focus:border-accent-red/50 focus:outline-none transition-colors"
              />
              {name.trim() && (
                <p className="mt-1.5 font-body text-xs text-text-muted">
                  Slug: <span className="text-text-secondary">/communities/{slugify(name)}</span>
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 block">
                Description <span className="text-text-muted">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this community about?"
                rows={3}
                className="w-full resize-none rounded-xl border border-white/10 bg-bg-surface px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted focus:border-accent-red/50 focus:outline-none transition-colors"
              />
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
                disabled={!name.trim() || submitting}
                className="rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? "Creating..." : "Create Community"}
              </button>
              <Link
                to="/communities"
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
