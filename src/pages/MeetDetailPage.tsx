import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";
import useMeets from "@/hooks/useMeets";
import { supabase } from "@/lib/supabase";
import type { Meet } from "@/types/meet";

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

function getTimeUntil(dateStr: string): string {
  const now = new Date();
  const meetDate = new Date(dateStr + "T00:00:00");
  const diffMs = meetDate.getTime() - now.getTime();
  if (diffMs < 0) return "Past event";
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `In ${days} days`;
  if (days < 30) return `In ${Math.floor(days / 7)} weeks`;
  return `In ${Math.floor(days / 30)} months`;
}

interface Attendee {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export default function MeetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { fetchMeet, deleteMeet, rsvpToMeet, unrsvpFromMeet } = useMeets();

  const [meet, setMeet] = useState<Meet | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [hasRsvped, setHasRsvped] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch meet
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchMeet(id).then((data) => {
      setMeet(data);
      setLoading(false);
    });
  }, [id, fetchMeet]);

  // Fetch attendees with profiles
  const loadAttendees = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from("meet_rsvps")
      .select("user_id, profiles(display_name, avatar_url)")
      .eq("meet_id", id);

    if (!data || data.length === 0) {
      setAttendees([]);
      return;
    }

    const attendeeList: Attendee[] = data.map((r: any) => ({
      user_id: r.user_id,
      display_name: r.profiles?.display_name ?? null,
      avatar_url: r.profiles?.avatar_url ?? null,
    }));

    setAttendees(attendeeList);
  }, [id]);

  useEffect(() => {
    loadAttendees();
  }, [loadAttendees]);

  // Check if current user has RSVPed
  useEffect(() => {
    if (!user || !id) return;
    supabase
      .from("meet_rsvps")
      .select("id")
      .eq("meet_id", id)
      .eq("user_id", user.id)
      .then(({ data }) => {
        setHasRsvped((data?.length ?? 0) > 0);
      });
  }, [user, id]);

  // Fetch creator name
  useEffect(() => {
    if (!meet) return;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", meet.creator_id)
      .single()
      .then(({ data }) => {
        setCreatorName(data?.display_name ?? "Anonymous");
      });
  }, [meet]);

  async function handleRsvp() {
    if (!id) return;
    setRsvpLoading(true);
    if (hasRsvped) {
      const success = await unrsvpFromMeet(id);
      if (success) {
        setHasRsvped(false);
        await loadAttendees();
      }
    } else {
      const success = await rsvpToMeet(id);
      if (success) {
        setHasRsvped(true);
        await loadAttendees();
      }
    }
    setRsvpLoading(false);
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: meet?.name ?? "Car Meet on RevD", url });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const fallbackImage =
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80";

  // Loading state
  if (loading) {
    return (
      <div className="page-enter">
        <div className="relative h-[50vh] animate-pulse bg-bg-surface" />
        <PageWrapper>
          <div className="space-y-4 py-8">
            <div className="h-10 w-2/3 animate-pulse rounded-lg bg-bg-surface" />
            <div className="h-6 w-1/3 animate-pulse rounded-lg bg-bg-surface" />
            <div className="h-32 w-full animate-pulse rounded-lg bg-bg-surface" />
          </div>
        </PageWrapper>
      </div>
    );
  }

  // Not found
  if (!meet) {
    return (
      <div className="page-enter">
        <SEOHead title="Meet Not Found" description="This meet doesn't exist." />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="font-mono text-6xl font-black text-text-muted">404</div>
          <h1 className="font-display mt-4 text-2xl uppercase tracking-wide text-text-primary">
            Meet not found
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            This meet may have been removed or the link is incorrect.
          </p>
          <Link
            to="/meets"
            className="mt-6 rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
          >
            Browse Meets
          </Link>
        </div>
      </div>
    );
  }

  const isPast = new Date(meet.date + "T23:59:59") < new Date();
  const isFull =
    meet.max_attendees !== null && attendees.length >= meet.max_attendees;
  const isCreator = user?.id === meet.creator_id;
  const spotsLeft =
    meet.max_attendees !== null
      ? meet.max_attendees - attendees.length
      : null;

  return (
    <div className="page-enter">
      <SEOHead
        title={`${meet.name} — Car Meet on RevD`}
        description={`${meet.meet_type ? meet.meet_type + " · " : ""}${formatFullDate(meet.date)}${meet.location_name ? " · " + meet.location_name : ""}. ${attendees.length} attending. Join the meet on RevD.`}
        ogImage={meet.cover_image_url || fallbackImage}
      />

      {/* ─── Cinematic Hero ─────────────────────────────────── */}
      <section className="relative w-full overflow-hidden">
        <div className="relative h-[50vh] min-h-[400px] max-h-[600px] w-full">
          <img
            src={meet.cover_image_url || fallbackImage}
            alt={meet.name}
            className="h-full w-full object-cover"
            loading="eager"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImage;
            }}
          />

          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-base/60 via-transparent to-transparent" />

          {/* Back button */}
          <div className="absolute top-6 left-6 z-10">
            <Link
              to="/meets"
              className="inline-flex items-center gap-2 rounded-full bg-bg-base/70 px-4 py-2 backdrop-blur-md border border-white/10 font-body text-sm text-white/80 hover:text-white hover:bg-bg-base/90 transition-all"
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
              All Meets
            </Link>
          </div>

          {/* Title overlay */}
          <div className="absolute inset-x-0 bottom-0 px-6 pb-24 sm:px-10 sm:pb-28">
            <div className="mx-auto max-w-7xl">
              {/* Meet type badge */}
              {meet.meet_type && (
                <div className="mb-4 inline-flex rounded-full bg-accent-red/90 px-4 py-1.5 backdrop-blur-sm">
                  <span className="font-body text-[11px] font-bold uppercase tracking-widest text-white">
                    {meet.meet_type}
                  </span>
                </div>
              )}

              <h1 className="font-display text-4xl uppercase tracking-wide text-white leading-none sm:text-5xl lg:text-6xl">
                {meet.name}
              </h1>

              <p className="mt-3 font-body text-base text-white/70 sm:text-lg">
                Hosted by{" "}
                <span className="text-white font-semibold">{creatorName ?? "..."}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ─── Floating Stats Bar ──────────────────────────── */}
        <div className="relative z-10 mx-4 -mt-12 rounded-xl border border-white/10 bg-bg-surface/80 px-5 py-5 shadow-2xl shadow-black/40 backdrop-blur-md sm:mx-8 sm:px-8 lg:mx-auto lg:max-w-5xl">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {/* Date */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-accent-red/10 border border-accent-red/20">
                <span className="font-body text-[9px] font-bold uppercase tracking-wider text-accent-red leading-none">
                  {getDayOfWeek(meet.date)}
                </span>
                <span className="font-mono text-lg font-black text-accent-red leading-none mt-0.5">
                  {new Date(meet.date + "T00:00:00").getDate()}
                </span>
              </div>
              <div>
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Date
                </p>
                <p className="font-body text-sm font-semibold text-text-primary">
                  {formatShortDate(meet.date)}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-bg-elevated border border-white/5">
                <svg
                  className="h-5 w-5 text-text-secondary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Time
                </p>
                <p className="font-body text-sm font-semibold text-text-primary">
                  {meet.time ? formatTime(meet.time) : "TBA"}
                </p>
              </div>
            </div>

            {/* Attendees */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-bg-elevated border border-white/5">
                <svg
                  className="h-5 w-5 text-text-secondary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Attending
                </p>
                <p className="font-body text-sm font-semibold text-text-primary">
                  {attendees.length}
                  {meet.max_attendees && (
                    <span className="text-text-muted"> / {meet.max_attendees}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-bg-elevated border border-white/5">
                <svg
                  className="h-5 w-5 text-text-secondary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 22h14" />
                  <path d="M5 2h14" />
                  <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                  <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                </svg>
              </div>
              <div>
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Status
                </p>
                <p
                  className={`font-body text-sm font-semibold ${
                    isPast ? "text-text-muted" : "text-accent-red"
                  }`}
                >
                  {isPast ? "Past Event" : getTimeUntil(meet.date)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Content ───────────────────────────────────────── */}
      <PageWrapper>
        <div className="grid gap-8 lg:grid-cols-3 py-4">
          {/* Left column: details */}
          <div className="space-y-8 lg:col-span-2">
            {/* Description */}
            {meet.description && (
              <section>
                <h2 className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">
                  About This Meet
                </h2>
                <div className="rounded-xl border border-border bg-bg-surface p-6">
                  <p className="font-body text-base text-text-secondary leading-relaxed whitespace-pre-line">
                    {meet.description}
                  </p>
                </div>
              </section>
            )}

            {/* Location */}
            {meet.location_name && (
              <section>
                <h2 className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">
                  Location
                </h2>
                <div className="rounded-xl border border-border bg-bg-surface p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-red/10 border border-accent-red/20">
                      <svg
                        className="h-5 w-5 text-accent-red"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-display text-lg uppercase tracking-wide text-text-primary">
                        {meet.location_name}
                      </p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meet.location_name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 font-body text-sm text-accent-red hover:text-accent-hover transition-colors"
                      >
                        Open in Google Maps
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
                            d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Attendees list */}
            <section>
              <h2 className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">
                Who's Going ({attendees.length})
              </h2>
              <div className="rounded-xl border border-border bg-bg-surface p-6">
                {attendees.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {attendees.map((a) => (
                      <div
                        key={a.user_id}
                        className="flex items-center gap-2.5 rounded-full bg-bg-elevated border border-white/5 px-4 py-2"
                      >
                        {a.avatar_url ? (
                          <img
                            src={a.avatar_url}
                            alt={a.display_name ?? ""}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-red/20 text-accent-red">
                            <span className="font-body text-xs font-bold">
                              {(a.display_name ?? "?")[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="font-body text-sm font-medium text-text-primary">
                          {a.display_name ?? "Anonymous"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-body text-sm text-text-muted text-center py-4">
                    No one has RSVPed yet. Be the first!
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Right column: actions sidebar */}
          <div className="space-y-6">
            {/* RSVP Card */}
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border border-border bg-bg-surface p-6">
                <h3 className="font-display text-lg uppercase tracking-wide text-text-primary mb-2">
                  {isPast ? "This Meet Has Ended" : "Join This Meet"}
                </h3>

                {!isPast && spotsLeft !== null && (
                  <p className="font-body text-sm text-text-secondary mb-4">
                    <span
                      className={`font-mono font-bold ${
                        spotsLeft <= 5 ? "text-accent-red" : "text-text-primary"
                      }`}
                    >
                      {spotsLeft}
                    </span>{" "}
                    {spotsLeft === 1 ? "spot" : "spots"} remaining
                  </p>
                )}

                {!isPast && (
                  <>
                    {user ? (
                      <button
                        onClick={handleRsvp}
                        disabled={rsvpLoading || (isFull && !hasRsvped)}
                        className={`w-full rounded-lg py-3.5 font-body text-sm font-bold uppercase tracking-wider transition-all cursor-pointer disabled:cursor-not-allowed ${
                          hasRsvped
                            ? "border-2 border-accent-red text-accent-red hover:bg-accent-red/10"
                            : "bg-accent-red text-white hover:bg-accent-hover shadow-lg shadow-accent-red/20 disabled:opacity-50"
                        }`}
                      >
                        {rsvpLoading
                          ? "..."
                          : hasRsvped
                            ? "Cancel RSVP"
                            : isFull
                              ? "Meet is Full"
                              : "RSVP — I'm Going"}
                      </button>
                    ) : (
                      <Link
                        to={`/sign-in?redirect=/meets/${id}`}
                        className="block w-full rounded-lg bg-accent-red py-3.5 text-center font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover shadow-lg shadow-accent-red/20"
                      >
                        Sign In to RSVP
                      </Link>
                    )}
                  </>
                )}

                {/* Share button */}
                <button
                  onClick={handleShare}
                  className="mt-3 w-full rounded-lg border border-border py-3 font-body text-sm font-semibold text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                  </svg>
                  {copied ? "Link Copied!" : "Share This Meet"}
                </button>
              </div>

              {/* Meet details card */}
              <div className="rounded-xl border border-border bg-bg-surface p-6">
                <h3 className="font-display text-base uppercase tracking-widest text-text-muted mb-4">
                  Details
                </h3>
                <dl className="space-y-3">
                  <div className="flex items-center justify-between">
                    <dt className="font-body text-sm text-text-secondary">Date</dt>
                    <dd className="font-body text-sm font-semibold text-text-primary">
                      {formatFullDate(meet.date)}
                    </dd>
                  </div>
                  {meet.time && (
                    <div className="flex items-center justify-between border-t border-border/50 pt-3">
                      <dt className="font-body text-sm text-text-secondary">Time</dt>
                      <dd className="font-body text-sm font-semibold text-text-primary">
                        {formatTime(meet.time)}
                      </dd>
                    </div>
                  )}
                  {meet.meet_type && (
                    <div className="flex items-center justify-between border-t border-border/50 pt-3">
                      <dt className="font-body text-sm text-text-secondary">Type</dt>
                      <dd className="font-body text-sm font-semibold text-accent-red">
                        {meet.meet_type}
                      </dd>
                    </div>
                  )}
                  {meet.location_name && (
                    <div className="flex items-center justify-between border-t border-border/50 pt-3">
                      <dt className="font-body text-sm text-text-secondary">Location</dt>
                      <dd className="font-body text-sm font-semibold text-text-primary text-right max-w-[60%]">
                        {meet.location_name}
                      </dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-border/50 pt-3">
                    <dt className="font-body text-sm text-text-secondary">Hosted by</dt>
                    <dd className="font-body text-sm font-semibold text-text-primary">
                      {creatorName ?? "..."}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Creator actions */}
              {isCreator && (
                <div className="rounded-xl border border-accent-red/20 bg-accent-red/5 p-4">
                  <p className="font-body text-xs font-bold uppercase tracking-wider text-accent-red mb-1">
                    You created this meet
                  </p>
                  <p className="font-body text-sm text-text-secondary mb-3">
                    Share the link to invite people.
                  </p>
                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 font-body text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Meet
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="font-body text-xs text-red-400">Delete permanently?</span>
                      <button
                        onClick={async () => {
                          setDeleting(true);
                          const ok = await deleteMeet(meet.id);
                          if (ok) {
                            navigate("/meets");
                          } else {
                            setDeleting(false);
                            setConfirmDelete(false);
                          }
                        }}
                        disabled={deleting}
                        className="font-body text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {deleting ? "Deleting..." : "Yes, delete"}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="font-body text-xs text-text-muted hover:text-white transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
