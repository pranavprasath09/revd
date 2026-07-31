import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import useBuildLogs from "@/hooks/useBuildLogs";
import PageHeader from "@/components/pitwall/PageHeader";
import PWButton from "@/components/pitwall/Button";
import Field, { FormSection, TextareaField } from "@/components/pitwall/Field";
import type { BuildLog } from "@/types/buildlog";

export default function AddBuildEntryPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuthContext();
  const { fetchBuildLog, addEntry } = useBuildLogs();
  const navigate = useNavigate();

  const [build, setBuild] = useState<BuildLog | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [cost, setCost] = useState("");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [triedSubmit, setTriedSubmit] = useState(false);

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
    setTriedSubmit(true);
    if (!build || !id || !title.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const parsedCost = Math.round(parseFloat(cost));
      const costNum = Number.isNaN(parsedCost) ? 0 : parsedCost;
      const result = await addEntry(
        {
          build_log_id: id,
          title: title.trim(),
          body: body.trim() || undefined,
          cost: costNum > 0 ? costNum : undefined,
          entry_date: entryDate || undefined,
        },
        files,
      );

      if (result.data) {
        previews.forEach((p) => URL.revokeObjectURL(p));
        navigate(`/builds/${id}`);
      } else {
        setError(
          result.error ??
            "Failed to add entry. Make sure the builds storage bucket exists.",
        );
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || pageLoading) {
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
        <SEOHead title="Add Entry" description="Add an entry to your build log." />
        <PageHeader
          breadcrumb={[{ label: "Builds" }, { label: "New entry", accent: true }]}
          title="LOG AN ENTRY"
        />
        <div className="px-6 md:px-11">
          <p className="max-w-[460px] text-sm leading-relaxed text-text-secondary">
            Sign in to add to the build log.
          </p>
          <div className="mt-6">
            <Link to={`/sign-in?redirect=/builds/${id}/add-entry`}>
              <PWButton>Sign in</PWButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!build) {
    return (
      <div className="page-enter px-6 pb-[72px] pt-[34px] md:px-11">
        <SEOHead title="Build not found" description="This build log doesn't exist." />
        <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-signal-red">
          Error
        </div>
        <h1 className="mt-2 font-mono text-[56px] font-bold leading-[0.9] tracking-[-0.045em] md:text-[96px]">
          404
        </h1>
        <div className="mt-7">
          <Link
            to="/builds"
            className="border-b border-accent pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent"
          >
            Browse builds
          </Link>
        </div>
      </div>
    );
  }

  if (build.owner_id !== user.id) {
    return (
      <div className="page-enter">
        <PageHeader kicker="Not authorized" title="LOCKED" />
        <div className="px-6 md:px-11">
          <p className="max-w-[460px] text-sm leading-relaxed text-text-secondary">
            Only the build owner can add entries.
          </p>
          <div className="mt-6">
            <Link to={`/builds/${id}`}>
              <PWButton variant="secondary">View build</PWButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter pb-[72px]">
      <SEOHead
        title={`Add Entry — ${build.title}`}
        description={`Add a new entry to your ${build.title} build log.`}
      />

      <PageHeader
        breadcrumb={[
          { label: "Builds" },
          { label: build.title },
          { label: "New entry", accent: true },
        ]}
        title="LOG AN ENTRY"
      />

      <form onSubmit={handleSubmit} className="max-w-[780px] px-6 md:px-11">
        <FormSection label="The entry" />
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Title"
            value={title}
            maxLength={200}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Coilovers in, camber plates next"
            className="md:col-span-2"
            error={
              triedSubmit && !title.trim()
                ? "Required — title the entry"
                : undefined
            }
          />
          <TextareaField
            label="Detail"
            value={body}
            maxLength={20000}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Parts used, time spent, tips for others"
            rows={5}
            className="md:col-span-2"
          />
          <Field
            label="Cost ($)"
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0"
            min={0}
            step="0.01"
          />
          <Field
            label="Date"
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
          />
        </div>

        <FormSection label="Photos" />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesChange}
          className="hidden"
          id="entry-photo-upload"
        />
        <label
          htmlFor="entry-photo-upload"
          className="block cursor-pointer border border-border-alpha px-5 py-6 text-center transition-colors duration-100 hover:border-accent"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
            + Add photos
          </span>
          <span className="mt-1.5 block font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
            PNG, JPG, WebP up to 10MB each
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
            {files.length} {files.length === 1 ? "photo" : "photos"} selected
          </p>
        )}

        {error && (
          <p className="mt-5 border border-signal-red px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-signal-red">
            {error}
          </p>
        )}

        <div className="mt-10 flex items-center gap-[18px] border-t border-border-alpha pt-[22px]">
          <PWButton type="submit" disabled={submitting}>
            {submitting ? "Uploading…" : "Add entry"}
          </PWButton>
          <Link
            to={`/builds/${id}`}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary transition-colors duration-100 hover:text-text-primary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
