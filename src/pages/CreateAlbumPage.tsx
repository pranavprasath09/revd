import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";
import usePhotos from "@/hooks/usePhotos";

export default function CreateAlbumPage() {
  const { user } = useAuthContext();
  const { createAlbum } = usePhotos();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [carTagsInput, setCarTagsInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;

    setFiles((prev) => [...prev, ...selected]);

    // Generate previews
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (files.length === 0) {
      setError("Please add at least one photo.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const carTags = carTagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const album = await createAlbum(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          car_tags: carTags.length > 0 ? carTags : undefined,
        },
        files
      );

      if (album) {
        navigate(`/photos/${album.id}`);
      } else {
        setError("Failed to create album. Make sure the photos storage bucket exists.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Not signed in
  if (!user) {
    return (
      <div className="page-enter">
        <SEOHead title="Create Album" description="Upload your car photography on RevD." />
        <div className="flex flex-col items-center justify-center py-32 text-center">
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
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
          <h2 className="font-display text-2xl uppercase tracking-wide text-text-primary mb-2">
            Sign In Required
          </h2>
          <p className="font-body text-sm text-text-secondary max-w-md mb-6">
            You need to be signed in to create a photo album.
          </p>
          <Link
            to="/sign-in?redirect=/photos/create"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
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
        title="Create Album"
        description="Upload your car photography and share it with the RevD community."
      />

      {/* Header */}
      <div className="border-b border-border bg-bg-surface/50">
        <PageWrapper>
          <div className="py-10 sm:py-14">
            <Link
              to="/photos"
              className="font-body text-sm text-text-secondary hover:text-accent-red transition-colors inline-flex items-center gap-1 mb-4"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Photos
            </Link>
            <p className="font-body text-[11px] font-bold uppercase tracking-widest text-accent-red mb-3">
              Upload
            </p>
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-text-primary leading-none">
              Create Album
            </h1>
            <p className="font-body mt-3 max-w-2xl text-base text-text-secondary leading-relaxed">
              Share your car photography. Upload your shots, tag the cars, and let the community see your work.
            </p>
          </div>
        </PageWrapper>
      </div>

      {/* Form */}
      <PageWrapper>
        <form onSubmit={handleSubmit} className="max-w-2xl py-8 space-y-6">
          {/* Title */}
          <div>
            <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
              Album Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "GT3 RS at Sunset", "Cars & Coffee March 2026"'
              required
              className="font-body w-full rounded-lg border border-border bg-bg-surface py-3 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the story behind these shots..."
              rows={3}
              className="font-body w-full rounded-lg border border-border bg-bg-surface py-3 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25 resize-none"
            />
          </div>

          {/* Car Tags */}
          <div>
            <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
              Car Tags <span className="text-text-muted/50">(comma separated)</span>
            </label>
            <input
              type="text"
              value={carTagsInput}
              onChange={(e) => setCarTagsInput(e.target.value)}
              placeholder='e.g. "Porsche 911, BMW M3, Nissan GTR"'
              className="font-body w-full rounded-lg border border-border bg-bg-surface py-3 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
              Photos *
            </label>
            <div className="rounded-xl border-2 border-dashed border-border bg-bg-surface/50 p-8 text-center transition-colors hover:border-accent-red/30">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
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
                  Click to upload or drag and drop
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
                  <div key={i} className="group relative aspect-square rounded-lg overflow-hidden border border-border">
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
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
            disabled={submitting || !title.trim() || files.length === 0}
            className="w-full rounded-lg bg-accent-red py-3.5 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? "Uploading..." : "Publish Album"}
          </button>
        </form>
      </PageWrapper>
    </div>
  );
}
