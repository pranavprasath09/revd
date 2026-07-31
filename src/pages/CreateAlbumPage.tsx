import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import usePhotos from "@/hooks/usePhotos";
import { validateImageFile } from "@/lib/upload";
import PageHeader from "@/components/pitwall/PageHeader";
import PWButton from "@/components/pitwall/Button";
import Field, { FormSection, TextareaField } from "@/components/pitwall/Field";

export default function CreateAlbumPage() {
  const { user, loading: authLoading } = useAuthContext();
  const { createAlbum } = usePhotos();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [carTagsInput, setCarTagsInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [triedSubmit, setTriedSubmit] = useState(false);

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;

    // Validate up front so the user sees the real reason a file is rejected
    try {
      selected.forEach(validateImageFile);
    } catch (err) {
      setError((err as Error).message);
      return;
    }
    setError("");
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
    setTriedSubmit(true);
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
        files,
      );

      if (album) {
        navigate(`/photos/${album.id}`);
      } else {
        setError(
          "Failed to create album. Make sure the photos storage bucket exists.",
        );
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="page-enter px-6 py-[34px] md:px-11">
        <div className="h-12 w-1/3 animate-pulse bg-bg-surface" />
        <div className="mt-6 h-64 animate-pulse bg-bg-surface" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-enter">
        <SEOHead title="Create Album" description="Upload your car photography on RevD." />
        <PageHeader
          breadcrumb={[{ label: "Photos" }, { label: "New album", accent: true }]}
          title="PUBLISH AN ALBUM"
        />
        <div className="px-6 md:px-11">
          <p className="max-w-[460px] text-sm leading-relaxed text-text-secondary">
            Sign in to publish your plates.
          </p>
          <div className="mt-6">
            <Link to="/sign-in?redirect=/photos/create">
              <PWButton>Sign in</PWButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter pb-[72px]">
      <SEOHead
        title="Create Album"
        description="Upload your car photography to RevD — albums, shoots, and automotive art."
      />

      <PageHeader
        breadcrumb={[{ label: "Photos" }, { label: "New album", accent: true }]}
        title="PUBLISH AN ALBUM"
      />

      <form onSubmit={handleSubmit} className="max-w-[780px] px-6 md:px-11">
        <FormSection label="The album" />
        <div className="grid gap-5">
          <Field
            label="Title"
            value={title}
            maxLength={200}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Night Shift: Tokyo Loop"
            error={
              triedSubmit && !title.trim()
                ? "Required — title the album"
                : undefined
            }
          />
          <TextareaField
            label="Description"
            value={description}
            maxLength={2000}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Where, when, and what you shot"
            rows={3}
          />
          <Field
            label="Car tags"
            value={carTagsInput}
            onChange={(e) => setCarTagsInput(e.target.value)}
            placeholder="R34, Supra, FD — comma separated"
            hint="Comma separated"
          />
        </div>

        <FormSection label="The plates" />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesChange}
          className="hidden"
          id="album-photo-upload"
        />
        <label
          htmlFor="album-photo-upload"
          className="block cursor-pointer border border-border-alpha px-5 py-6 text-center transition-colors duration-100 hover:border-accent"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
            + Add photos
          </span>
          <span className="mt-1.5 block font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
            PNG, JPG, WebP up to 10MB each · first photo becomes the cover
          </span>
        </label>

        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {previews.map((src, i) => (
              <div
                key={src}
                className="group relative aspect-square overflow-hidden border border-border-alpha"
              >
                <img src={src} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 bg-bg-base/80 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-accent">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 cursor-pointer items-center justify-center bg-bg-base/80 font-mono text-[11px] text-text-primary opacity-0 transition-opacity duration-100 group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {files.length > 0 && (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            {files.length} {files.length === 1 ? "plate" : "plates"} selected
          </p>
        )}

        {error && (
          <p className="mt-5 border border-signal-red px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-signal-red">
            {error}
          </p>
        )}

        <div className="mt-10 flex items-center gap-[18px] border-t border-border-alpha pt-[22px]">
          <PWButton type="submit" disabled={submitting}>
            {submitting ? "Uploading…" : "Publish album"}
          </PWButton>
          <Link
            to="/photos"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary transition-colors duration-100 hover:text-text-primary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
