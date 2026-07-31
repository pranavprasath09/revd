import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import useForums from "@/hooks/useForums";
import { supabase } from "@/lib/supabase";
import { prepareImageForUpload, validateImageFile } from "@/lib/upload";
import PageHeader from "@/components/pitwall/PageHeader";
import PWButton from "@/components/pitwall/Button";
import Field, { FormSection, TextareaField } from "@/components/pitwall/Field";
import type { Community } from "@/types/forum";

export default function CreatePostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading, isPremium, tierLoaded } = useAuthContext();
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
  const [triedSubmit, setTriedSubmit] = useState(false);

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
    try {
      validateImageFile(file);
    } catch (err) {
      setError((err as Error).message);
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTriedSubmit(true);
    if (!community || !user || !title.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const prepared = await prepareImageForUpload(imageFile);
        const ext = prepared.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(path, prepared);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("posts").getPublicUrl(path);
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

  if (authLoading || loading) {
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
          breadcrumb={[{ label: "Departments" }, { label: "New post", accent: true }]}
          title="NEW POST"
        />
        <div className="px-6 md:px-11">
          <p className="max-w-[460px] text-sm leading-relaxed text-text-secondary">
            Sign in to post to the department.
          </p>
          <div className="mt-6">
            <Link to={`/sign-in?redirect=/communities/${slug}/create`}>
              <PWButton>Sign in</PWButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="page-enter px-6 pb-[72px] pt-[34px] md:px-11">
        <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-signal-red">
          Error
        </div>
        <h1 className="mt-2 font-mono text-[56px] font-bold leading-[0.9] tracking-[-0.045em] md:text-[96px]">
          404
        </h1>
        <p className="mt-4 max-w-[460px] text-[15px] leading-relaxed text-text-secondary">
          No department at that address.
        </p>
        <div className="mt-7">
          <Link
            to="/communities"
            className="border-b border-accent pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent"
          >
            Browse departments
          </Link>
        </div>
      </div>
    );
  }

  // Premium gate — RLS enforces this server-side (migration 013); this is the
  // friendly version. Wait for tierLoaded so PRO members don't see it flash.
  if (community.is_premium_only && tierLoaded && !isPremium) {
    return (
      <div className="page-enter">
        <PageHeader kicker="Pro members only" title="LOCKED" />
        <div className="px-6 md:px-11">
          <p className="max-w-[460px] text-sm leading-relaxed text-text-secondary">
            {community.name} is a premium department. Upgrade to RevD PRO to
            post here.
          </p>
          <div className="mt-6">
            <Link to="/premium">
              <PWButton>Go Pro</PWButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter pb-[72px]">
      <SEOHead
        title={`New Post — ${community.name}`}
        description={`Create a new post in the ${community.name} community.`}
      />

      <PageHeader
        breadcrumb={[
          { label: "Departments" },
          { label: community.name },
          { label: "New post", accent: true },
        ]}
        title="NEW POST"
      />

      <form onSubmit={handleSubmit} className="max-w-[780px] px-6 md:px-11">
        <FormSection label="The post" />
        <div className="grid gap-5">
          <Field
            label="Title"
            value={title}
            maxLength={300}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Is the FD's apex seal fear overblown?"
            error={
              triedSubmit && !title.trim()
                ? "Required — give the post a title"
                : undefined
            }
          />
          <TextareaField
            label="Body"
            value={body}
            maxLength={20000}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Make the argument"
            rows={6}
          />
        </div>

        <FormSection label="Image" />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="post-image-upload"
        />
        <label
          htmlFor="post-image-upload"
          className="block cursor-pointer border border-border-alpha px-5 py-6 text-center transition-colors duration-100 hover:border-accent"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
            {imageFile ? "Change image" : "+ Add an image"}
          </span>
        </label>
        {imagePreview && (
          <div className="relative mt-4 w-fit">
            <img
              src={imagePreview}
              alt="Post preview"
              className="max-h-64 border border-border-alpha object-cover"
            />
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(imagePreview);
                setImageFile(null);
                setImagePreview(null);
              }}
              aria-label="Remove image"
              className="absolute right-1.5 top-1.5 flex h-6 w-6 cursor-pointer items-center justify-center bg-bg-base/80 font-mono text-[11px] text-text-primary"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <p className="mt-5 border border-signal-red px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-signal-red">
            {error}
          </p>
        )}

        <div className="mt-10 flex items-center gap-[18px] border-t border-border-alpha pt-[22px]">
          <PWButton type="submit" disabled={submitting}>
            {submitting ? "Posting…" : "Post it"}
          </PWButton>
          <Link
            to={`/communities/${slug}`}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary transition-colors duration-100 hover:text-text-primary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
