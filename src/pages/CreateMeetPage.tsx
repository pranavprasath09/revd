import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import useMeets from "@/hooks/useMeets";
import PageHeader from "@/components/pitwall/PageHeader";
import PWButton from "@/components/pitwall/Button";
import Field, { FormSection, TextareaField } from "@/components/pitwall/Field";
import { Chip } from "@/components/pitwall/FilterBar";

const MEET_TYPE_OPTIONS = ["Cars & Coffee", "Track Day", "Cruise", "Show", "Private"];

export default function CreateMeetPage() {
  const { user, loading: authLoading } = useAuthContext();
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
  const [triedSubmit, setTriedSubmit] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTriedSubmit(true);
    if (!name.trim() || !date) return;

    setSubmitting(true);
    setError("");
    try {
      const result = await createMeet({
        name: name.trim(),
        description: description.trim() || undefined,
        location_name: locationName.trim() || undefined,
        date,
        time: time || undefined,
        meet_type: meetType || undefined,
        cover_image_url: coverImageUrl.trim() || undefined,
        max_attendees: maxAttendees ? parseInt(maxAttendees, 10) : undefined,
      });
      if (result.data) {
        navigate(`/meets/${result.data.id}`);
      } else {
        setError(result.error ?? "Failed to create meet. Please try again.");
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
        <SEOHead title="Create a Meet" description="Organize a car meet on RevD." />
        <PageHeader
          breadcrumb={[{ label: "Meets" }, { label: "New", accent: true }]}
          title="HOST A MEET"
        />
        <div className="px-6 md:px-11">
          <p className="max-w-[460px] text-sm leading-relaxed text-text-secondary">
            Sign in to put a meet on the calendar.
          </p>
          <div className="mt-6">
            <Link to="/sign-in?redirect=/meets/create">
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
        title="Create a Meet"
        description="Organize a car meet on RevD. Set the date, location, and type — then share it with the community."
      />

      <PageHeader
        breadcrumb={[{ label: "Meets" }, { label: "New", accent: true }]}
        title="HOST A MEET"
      />

      <form onSubmit={handleSubmit} className="max-w-[780px] px-6 md:px-11">
        <FormSection label="The meet" />
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Name"
            value={name}
            maxLength={200}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sunrise Canyon Run"
            className="md:col-span-2"
            error={
              triedSubmit && !name.trim() ? "Required — name the meet" : undefined
            }
          />
          <TextareaField
            label="Description"
            value={description}
            maxLength={2000}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Route, pace, rules of the run"
            rows={3}
            className="md:col-span-2"
          />
          <Field
            label="Location"
            value={locationName}
            maxLength={200}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Angeles Crest Highway, CA"
            className="md:col-span-2"
          />
          <Field
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={triedSubmit && !date ? "Required — pick a date" : undefined}
          />
          <Field
            label="Roll out"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <Field
            label="Capacity"
            type="number"
            min={1}
            value={maxAttendees}
            onChange={(e) => setMaxAttendees(e.target.value)}
            placeholder="60"
          />
          <Field
            label="Cover image URL"
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>

        <FormSection label="Type" />
        <div className="flex flex-wrap gap-2">
          {MEET_TYPE_OPTIONS.map((t) => (
            <Chip
              key={t}
              label={t}
              active={meetType === t}
              onClick={() => setMeetType(meetType === t ? "" : t)}
            />
          ))}
        </div>

        {coverImageUrl.trim() && (
          <>
            <FormSection label="Cover preview" />
            <img
              src={coverImageUrl}
              alt="Cover preview"
              className="h-40 w-full max-w-[420px] object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </>
        )}

        {error && (
          <p className="mt-5 border border-signal-red px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-signal-red">
            {error}
          </p>
        )}

        <div className="mt-10 flex items-center gap-[18px] border-t border-border-alpha pt-[22px]">
          <PWButton type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Put it on the calendar"}
          </PWButton>
          <Link
            to="/meets"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary transition-colors duration-100 hover:text-text-primary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
