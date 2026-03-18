import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";
import useMeets from "@/hooks/useMeets";

const MEET_TYPE_OPTIONS = ["Cars & Coffee", "Track Day", "Cruise", "Show", "Private"];

export default function CreateMeetPage() {
  const { user } = useAuthContext();
  const { createMeet } = useMeets();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [meetType, setMeetType] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !date) return;

    setSubmitting(true);
    setError("");

    try {
      const meet = await createMeet({
        name: name.trim(),
        description: description.trim() || undefined,
        location_name: locationName.trim() || undefined,
        date,
        time: time || undefined,
        meet_type: meetType || undefined,
        cover_image_url: coverImageUrl.trim() || undefined,
        max_attendees: maxAttendees ? parseInt(maxAttendees, 10) : undefined,
      });

      if (meet) {
        navigate(`/meets/${meet.id}`);
      } else {
        setError("Failed to create meet. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Not signed in — redirect prompt
  if (!user) {
    return (
      <div className="page-enter">
        <SEOHead title="Create a Meet" description="Organize a car meet on RevD." />
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
            You need to be signed in to create a car meet.
          </p>
          <Link
            to="/sign-in?redirect=/meets/create"
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
        title="Create a Meet"
        description="Organize a car meet on RevD. Set the date, location, and type — then share it with the community."
      />

      {/* Header */}
      <div className="border-b border-border bg-bg-surface/50">
        <PageWrapper>
          <div className="py-10 sm:py-14">
            <Link
              to="/meets"
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
              Back to Meets
            </Link>
            <p className="font-body text-[11px] font-bold uppercase tracking-widest text-accent-red mb-3">
              Organize
            </p>
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-text-primary leading-none">
              Create a Meet
            </h1>
            <p className="font-body mt-3 max-w-2xl text-base text-text-secondary leading-relaxed">
              Set the details, publish it, and share the link. It's that easy.
            </p>
          </div>
        </PageWrapper>
      </div>

      {/* Form */}
      <PageWrapper>
        <form onSubmit={handleSubmit} className="max-w-2xl py-8 space-y-6">
          {/* Meet name */}
          <div>
            <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
              Meet Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. "Sunday Morning Cars & Coffee", "SoCal Canyon Cruise"'
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
              placeholder="What's the vibe? Any rules? What to expect..."
              rows={4}
              className="font-body w-full rounded-lg border border-border bg-bg-surface py-3 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25 resize-none"
            />
          </div>

          {/* Date and Time row */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="font-body w-full rounded-lg border border-border bg-bg-surface py-3 px-4 text-sm text-text-primary outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25 [color-scheme:dark]"
              />
            </div>
            <div className="flex-1">
              <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
                Time <span className="text-text-muted/50">(optional)</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="font-body w-full rounded-lg border border-border bg-bg-surface py-3 px-4 text-sm text-text-primary outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
              Location <span className="text-text-muted/50">(optional)</span>
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder='e.g. "Pavilions Shopping Center, Scottsdale, AZ"'
              className="font-body w-full rounded-lg border border-border bg-bg-surface py-3 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25"
            />
          </div>

          {/* Meet type */}
          <div>
            <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
              Meet Type <span className="text-text-muted/50">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {MEET_TYPE_OPTIONS.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMeetType(meetType === type ? "" : type)}
                  className={`shrink-0 cursor-pointer rounded-full px-5 py-2 font-body text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    meetType === type
                      ? "bg-accent-red text-white shadow-md shadow-accent-red/25"
                      : "border border-white/10 bg-bg-surface text-text-secondary hover:border-accent-red/40 hover:text-text-primary"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Cover image URL */}
          <div>
            <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
              Cover Image URL <span className="text-text-muted/50">(optional)</span>
            </label>
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="font-body w-full rounded-lg border border-border bg-bg-surface py-3 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25"
            />
            {coverImageUrl && (
              <div className="mt-3 rounded-lg overflow-hidden border border-border">
                <img
                  src={coverImageUrl}
                  alt="Cover preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                  className="w-full h-40 object-cover"
                />
              </div>
            )}
          </div>

          {/* Max attendees */}
          <div>
            <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
              Max Attendees <span className="text-text-muted/50">(optional)</span>
            </label>
            <input
              type="number"
              value={maxAttendees}
              onChange={(e) => setMaxAttendees(e.target.value)}
              placeholder="Leave blank for unlimited"
              min={1}
              className="font-body w-full max-w-xs rounded-lg border border-border bg-bg-surface py-3 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="font-body text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !name.trim() || !date}
            className="w-full rounded-lg bg-accent-red py-3.5 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? "Creating..." : "Publish Meet"}
          </button>
        </form>
      </PageWrapper>
    </div>
  );
}
