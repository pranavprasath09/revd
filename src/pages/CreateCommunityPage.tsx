import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import useForums from "@/hooks/useForums";
import PageHeader from "@/components/pitwall/PageHeader";
import PWButton from "@/components/pitwall/Button";
import Field, { FormSection, TextareaField } from "@/components/pitwall/Field";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export default function CreateCommunityPage() {
  const { user, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const { createCommunity } = useForums();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [triedSubmit, setTriedSubmit] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTriedSubmit(true);
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      if (msg.includes("duplicate") || msg.includes("unique")) {
        setError("A department with that name already exists. Try a different name.");
      } else {
        setError(msg);
      }
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
        <PageHeader
          breadcrumb={[{ label: "Departments" }, { label: "New", accent: true }]}
          title="FOUND A DEPARTMENT"
          titleSize={38}
        />
        <div className="px-6 md:px-11">
          <p className="max-w-[460px] text-sm leading-relaxed text-text-secondary">
            Sign in to found a department.
          </p>
          <div className="mt-6">
            <Link to="/sign-in?redirect=/communities/create">
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
        title="Create a Community"
        description="Start a new car community on RevD."
      />

      <PageHeader
        breadcrumb={[{ label: "Departments" }, { label: "New", accent: true }]}
        title="FOUND A DEPARTMENT"
        titleSize={38}
      />

      <form onSubmit={handleSubmit} className="max-w-[780px] px-6 md:px-11">
        <FormSection label="The room" />
        <div className="grid gap-5">
          <Field
            label="Name"
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rotary"
            hint={
              name.trim() ? `Slug · /communities/${slugify(name)}` : undefined
            }
            error={
              triedSubmit && !name.trim()
                ? "Required — name the department"
                : undefined
            }
          />
          <TextareaField
            label="Description"
            value={description}
            maxLength={2000}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Its own weather — what is this room about?"
            rows={3}
          />
        </div>

        {error && (
          <p className="mt-5 border border-signal-red px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-signal-red">
            {error}
          </p>
        )}

        <div className="mt-10 flex items-center gap-[18px] border-t border-border-alpha pt-[22px]">
          <PWButton type="submit" disabled={submitting}>
            {submitting ? "Founding…" : "Found it"}
          </PWButton>
          <Link
            to="/communities"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary transition-colors duration-100 hover:text-text-primary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
