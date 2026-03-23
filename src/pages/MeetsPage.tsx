import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import CategoryFilter from "@/components/ui/CategoryFilter";
import { useAuthContext } from "@/context/AuthContext";
import useMeets from "@/hooks/useMeets";
import type { Meet } from "@/types/meet";

const MEET_TYPES = ["All", "Cars & Coffee", "Track Day", "Cruise", "Show", "Private"];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ─── Meet Card ──────────────────────────────────────────────────
interface MeetCardProps {
  meet: Meet;
  rsvpCount: number;
}

function MeetCard({ meet, rsvpCount }: MeetCardProps) {
  const fallbackImage =
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80";

  return (
    <Link
      to={`/meets/${meet.id}`}
      className="group rounded-xl border border-border bg-bg-surface overflow-hidden transition-all duration-300 hover:border-accent-red/30 hover:shadow-lg hover:shadow-accent-red/5"
    >
      {/* Cover image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={meet.cover_image_url || fallbackImage}
          alt={meet.name}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-bg-surface/20 to-transparent" />

        {/* Meet type badge */}
        {meet.meet_type && (
          <div className="absolute top-3 left-3 rounded-full bg-accent-red/90 px-3 py-1 backdrop-blur-sm">
            <span className="font-body text-[10px] font-bold uppercase tracking-wider text-white">
              {meet.meet_type}
            </span>
          </div>
        )}

        {/* Attendee count */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-bg-base/90 px-3 py-1.5 backdrop-blur-sm">
          <svg
            className="h-3.5 w-3.5 text-accent-red"
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
          <span className="font-mono text-sm font-bold text-text-primary">
            {rsvpCount}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="font-display text-xl uppercase tracking-wide text-text-primary leading-tight group-hover:text-accent-red transition-colors">
          {meet.name}
        </h3>

        <div className="mt-2 flex flex-col gap-1.5">
          {/* Date */}
          <div className="flex items-center gap-2">
            <svg
              className="h-3.5 w-3.5 shrink-0 text-accent-red"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span className="font-body text-sm text-text-secondary">
              {formatDate(meet.date)}
              {meet.time && ` · ${meet.time.slice(0, 5)}`}
            </span>
          </div>

          {/* Location */}
          {meet.location_name && (
            <div className="flex items-center gap-2">
              <svg
                className="h-3.5 w-3.5 shrink-0 text-accent-red"
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
              <span className="font-body text-sm text-text-secondary truncate">
                {meet.location_name}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ──────────────────────────────────────────────────
export default function MeetsPage() {
  const { user } = useAuthContext();
  const { loading, fetchMeets } = useMeets();
  const [meets, setMeets] = useState<Meet[]>([]);
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({});
  const [activeType, setActiveType] = useState("All");

  useEffect(() => {
    fetchMeets().then(setMeets);
  }, [fetchMeets]);

  // Fetch RSVP counts for all meets
  useEffect(() => {
    if (meets.length === 0) return;

    import("@/lib/supabase").then(({ supabase }) => {
      supabase
        .from("meet_rsvps")
        .select("meet_id")
        .in("meet_id", meets.map((m) => m.id))
        .then(({ data }) => {
          if (!data) return;
          const counts: Record<string, number> = {};
          data.forEach((r) => {
            counts[r.meet_id] = (counts[r.meet_id] || 0) + 1;
          });
          setRsvpCounts(counts);
        });
    });
  }, [meets]);

  const filteredMeets = useMemo(() => {
    if (activeType === "All") return meets;
    return meets.filter((m) => m.meet_type === activeType);
  }, [meets, activeType]);

  return (
    <div className="page-enter">
      <SEOHead
        title="Car Meets"
        description="Find and join car meets near you. Cars & Coffee, track days, cruises, shows, and more."
        canonicalUrl="https://revhub.com/meets"
      />

      {/* Header */}
      <div className="border-b border-border bg-bg-surface/50">
        <PageWrapper>
          <div className="py-10 sm:py-14">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-body text-[11px] font-bold uppercase tracking-widest text-accent-red mb-3">
                  Community
                </p>
                <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-text-primary leading-none">
                  Car Meets
                </h1>
                <p className="font-body mt-3 max-w-2xl text-base text-text-secondary leading-relaxed">
                  Find your next meet. RSVP, share with friends, and show up with your build.
                </p>
              </div>

              {user && (
                <Link
                  to="/meets/create"
                  className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-accent-red px-5 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
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
                      d="M12 5v14M5 12h14"
                    />
                  </svg>
                  Create Meet
                </Link>
              )}
            </div>

            {/* Type filter */}
            <div className="mt-8">
              <CategoryFilter
                categories={MEET_TYPES}
                active={activeType}
                onChange={setActiveType}
              />
            </div>
          </div>
        </PageWrapper>
      </div>

      {/* Content */}
      <PageWrapper>
        <div className="py-8">
          {loading ? (
            /* Loading skeleton */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-xl bg-bg-surface"
                />
              ))}
            </div>
          ) : filteredMeets.length > 0 ? (
            /* Meet grid */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMeets.map((meet) => (
                <MeetCard
                  key={meet.id}
                  meet={meet}
                  rsvpCount={rsvpCounts[meet.id] || 0}
                />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 text-center">
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
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
              </div>
              <h2 className="font-display text-2xl uppercase tracking-wide text-text-primary mb-2">
                No Meets Yet
              </h2>
              <p className="font-body text-sm text-text-secondary max-w-md mb-6">
                Be the first to organize a meet. Bring the car community together
                — it only takes a minute.
              </p>
              {user ? (
                <Link
                  to="/meets/create"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
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
                      d="M12 5v14M5 12h14"
                    />
                  </svg>
                  Create the First Meet
                </Link>
              ) : (
                <Link
                  to="/sign-in?redirect=/meets"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
                >
                  Sign In to Create a Meet
                </Link>
              )}
              <div className="mt-6 flex items-center gap-4">
                <Link to="/photos" className="font-body text-sm text-text-secondary hover:text-accent-red transition-colors">
                  Browse Photos
                </Link>
                <span className="text-text-muted">·</span>
                <Link to="/communities" className="font-body text-sm text-text-secondary hover:text-accent-red transition-colors">
                  Communities
                </Link>
                <span className="text-text-muted">·</span>
                <Link to="/cars" className="font-body text-sm text-text-secondary hover:text-accent-red transition-colors">
                  Explore Cars
                </Link>
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}
