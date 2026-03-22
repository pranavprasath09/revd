import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";
import useBuildLogs from "@/hooks/useBuildLogs";
import type { BuildLog } from "@/types/buildlog";

export default function AddBuildEntryPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const { fetchBuildLog, addEntry } = useBuildLogs();
  const navigate = useNavigate();

  const [build, setBuild] = useState<BuildLog | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [cost, setCost] = useState("");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchBuildLog(id).then((data) => {
      setBuild(data);
      setPageLoading(false);
    });
  }, [id, fetchBuildLog]);

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;
    setFiles((prev) => [...prev, ...selected]);
    const newPreviews = selected.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeFile(index: number) {
    setPreviews((prev) => {
      if (prev[index]) URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!build || !id || !title.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const costNum = cost ? parseInt(cost, 10) : 0;
      const result = await addEntry(
        {
          build_log_id: id,
          title: title.trim(),
          body: body.trim() || undefined,
          cost: costNum > 0 ? costNum : undefined,
          entry_date: entryDate || undefined,
        },
        files
      );

      if (result.data) {
        // Revoke all previews before navigating
        previews.forEach((p) => URL.revokeObjectURL(p));
        navigate(`/builds/${id}`);
      } else {
        setError(
          result.error ?? "Failed to add entry. Make sure the builds storage bucket exists."
        );
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Auth gate
  if (!user) {
    return (
      <div className="page-enter">
        <SEOHead title="Add Entry" description="Add an entry to your build log." />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <h2 className="font-display text-2xl uppercase tracking-wide text-text-primary mb-2">
            Sign In Required
          </h2>
          <p className="font-body text-sm text-text-secondary mb-6">
            You need to be signed in to add a build entry.
          </p>
          <Link
            to={`/sign-in?redirect=/builds/${id}/add-entry`}
            className="rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (pageLoading) {
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

  if (!build) {
    return (
      <div className="page-enter">
        <SEOHead title="Build Not Found" description="This build log doesn't exist." />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="font-mono text-6xl font-black text-text-muted">404</div>
          <h1 className="font-display mt-4 text-2xl uppercase tracking-wide text-text-primary">
            Build not found
          </h1>
          <Link
            to="/builds"
            className="mt-6 rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
          >
            Browse Builds
          </Link>
        </div>
      </div>
    );
  }

  // Owner gate
  if (build.owner_id !== user.id) {
    return (
      <div className="page-enter">
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <h2 className="font-display text-2xl uppercase tracking-wide text-text-primary mb-2">
            Not Authorized
          </h2>
          <p className="font-body text-sm text-text-secondary mb-6">
            Only the build owner can add entries.
          </p>
          <Link
            to={`/builds/${id}`}
            className="rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
          >
            View Build
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <SEOHead
        title={`Add Entry — ${build.title}`}
        description={`Add a new entry to your ${build.title} build log.`}
      />

      {/* Header */}
      <div className="border-b border-border bg-bg-surface/50">
        <PageWrapper>
          <div className="py-10 sm:py-14">
            <Link
              to={`/builds/${id}`}
              className="font-body text-sm text-text-secondary hover:text-accent-red transition-colors inline-flex items-center gap-1 mb-4"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to {build.title}
            </Link>
            <p className="font-body text-[11px] font-bold uppercase tracking-widest text-accent-red mb-3">
              New Entry
            </p>
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-text-primary leading-none">
              Add Entry
            </h1>
          </div>
        </PageWrapper>
      </div>

      {/* Form */}
      <PageWrapper>
        <form onSubmit={handleSubmit} className="max-w-2xl py-8 space-y-6">
          {/* Title */}
          <div>
            <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
              Entry Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "Installed coilovers", "Full respray — Nardo Grey"'
              required
              className="font-body w-full rounded-lg border border-border bg-bg-surface py-3 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25"
            />
          </div>

          {/* Body */}
          <div>
            <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
              Details <span className="text-text-muted/50">(optional)</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What did you do? Parts used, time spent, tips for others..."
              rows={5}
              className="font-body w-full rounded-lg border border-border bg-bg-surface py-3 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25 resize-none"
            />
          </div>

          {/* Cost and Date row */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
                Cost ($) <span className="text-text-muted/50">(optional)</span>
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0"
                min={0}
                className="font-body w-full rounded-lg border border-border bg-bg-surface py-3 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25"
              />
            </div>
            <div className="flex-1">
              <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
                Date
              </label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="font-body w-full rounded-lg border border-border bg-bg-surface py-3 px-4 text-sm text-text-primary outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
              Photos <span className="text-text-muted/50">(optional)</span>
            </label>
            <div className="rounded-xl border-2 border-dashed border-border bg-bg-surface/50 p-8 text-center transition-colors hover:border-accent-red/30">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
                className="hidden"
                id="entry-photo-upload"
              />
              <label htmlFor="entry-photo-upload" className="cursor-pointer">
                <svg
                  className="mx-auto h-12 w-12 text-text-muted"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
                  />
                </svg>
                <p className="mt-3 font-body text-sm text-text-secondary">
                  Click to upload photos
                </p>
                <p className="mt-1 font-body text-xs text-text-muted">
                  PNG, JPG, WebP up to 10MB each
                </p>
              </label>
            </div>

            {/* Preview grid */}
            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                {previews.map((src, i) => (
                  <div
                    key={src}
                    className="group relative aspect-square rounded-lg overflow-hidden border border-border"
                  >
                    <img
                      src={src}
                      alt={`Upload ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-bg-base/80 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {files.length > 0 && (
              <p className="mt-2 font-body text-xs text-text-secondary">
                {files.length} {files.length === 1 ? "photo" : "photos"} selected
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="font-body text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="w-full rounded-lg bg-accent-red py-3.5 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? "Uploading..." : "Add Entry"}
          </button>
        </form>
      </PageWrapper>
    </div>
  );
}
