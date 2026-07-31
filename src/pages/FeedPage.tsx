import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import useFeed from "@/hooks/useFeed";
import useMeets from "@/hooks/useMeets";
import PageHeader from "@/components/pitwall/PageHeader";
import PWButton, { ToggleButton } from "@/components/pitwall/Button";
import type { FeedEvent } from "@/types/notification";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/** created_at → session-log stamp HH:MM:SS. */
function stamp(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const EVENT_CODES: Record<string, string> = {
  new_album: "ALBUM",
  new_build_entry: "BUILD",
  new_meet: "MEET",
  new_post: "POST",
};

function eventDescription(event: FeedEvent): string {
  switch (event.event_type) {
    case "new_album":
      return "posted a photo album";
    case "new_build_entry":
      return "added a build entry";
    case "new_meet":
      return "created a meet";
    case "new_post":
      return "published a post";
    default:
      return "logged an event";
  }
}

function eventLink(event: FeedEvent): string | null {
  if (!event.entity_id) return null;
  switch (event.event_type) {
    case "new_album":
      return `/photos/${event.entity_id}`;
    case "new_build_entry":
      return event.metadata?.build_log_id
        ? `/builds/${event.metadata.build_log_id}`
        : null;
    case "new_meet":
      return `/meets/${event.entity_id}`;
    case "new_post":
      return event.metadata?.community_slug
        ? `/communities/${event.metadata.community_slug}/post/${event.entity_id}`
        : null;
    default:
      return null;
  }
}

function LogLine({
  event,
  rsvped,
  onToggleRsvp,
}: {
  event: FeedEvent;
  rsvped: boolean;
  onToggleRsvp: (meetId: string) => void;
}) {
  const navigate = useNavigate();
  const link = eventLink(event);
  const title = (event.metadata?.title as string) ?? eventDescription(event);
  const previewImage = (event.metadata?.preview_image as string) ?? null;
  const isMeet = event.event_type === "new_meet" && !!event.entity_id;

  return (
    <div
      onClick={link ? () => navigate(link) : undefined}
      className={`grid min-h-[62px] grid-cols-[96px_1fr] items-center gap-y-1 border-b border-border-hair px-6 py-2 transition-colors duration-100 hover:bg-bg-elevated md:grid-cols-[96px_132px_1fr_168px_132px] md:px-11 md:py-0 ${
        link ? "cursor-pointer" : ""
      }`}
    >
      <span className="font-mono text-[11px] text-text-muted">
        {stamp(event.created_at)}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-accent">
        [{EVENT_CODES[event.event_type] ?? "EVENT"}]
      </span>
      <span className="col-span-2 flex min-w-0 flex-col gap-0.5 md:col-span-1 md:pr-6">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-semibold tracking-[-0.015em] text-text-primary">
          {title}
        </span>
        <span className="font-mono text-[10px] text-text-secondary">
          {event.actor?.display_name ?? "Someone"} · {eventDescription(event)}
        </span>
      </span>
      <span className="hidden items-center gap-2.5 md:flex">
        {previewImage && (
          <img
            src={previewImage}
            alt=""
            loading="lazy"
            className="h-10 w-[84px] object-cover grayscale-[0.4]"
          />
        )}
        <span className="font-mono text-[10px] text-text-muted">
          {timeAgo(event.created_at)}
        </span>
      </span>
      <span className="hidden justify-end md:flex">
        {isMeet && (
          <ToggleButton
            on={rsvped}
            onClick={(e) => {
              e.stopPropagation();
              onToggleRsvp(event.entity_id!);
            }}
          >
            {rsvped ? "Going" : "RSVP"}
          </ToggleButton>
        )}
      </span>
    </div>
  );
}

export default function FeedPage() {
  const { user, loading: authLoading } = useAuthContext();
  const { events, loading, hasMore, fetchFeed } = useFeed();
  const { rsvpToMeet, unrsvpFromMeet, getUserRsvps } = useMeets();
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [rsvps, setRsvps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user && !initialLoaded) {
      fetchFeed(0).then(() => setInitialLoaded(true));
      getUserRsvps().then((ids) => setRsvps(new Set(ids)));
    }
  }, [user, fetchFeed, getUserRsvps, initialLoaded]);

  // Optimistic RSVP — update immediately, revert on error
  const toggleRsvp = async (meetId: string) => {
    const going = rsvps.has(meetId);
    setRsvps((prev) => {
      const next = new Set(prev);
      if (going) next.delete(meetId);
      else next.add(meetId);
      return next;
    });
    const ok = going ? await unrsvpFromMeet(meetId) : await rsvpToMeet(meetId);
    if (!ok) {
      setRsvps((prev) => {
        const next = new Set(prev);
        if (going) next.add(meetId);
        else next.delete(meetId);
        return next;
      });
    }
  };

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
        <SEOHead title="Feed" description="Your personalized activity feed on RevD." />
        <PageHeader kicker="Session log" title="ACTIVITY" />
        <div className="px-6 md:px-11">
          <p className="max-w-[460px] text-sm leading-relaxed text-text-secondary">
            The session log records what the people you follow do — albums,
            build entries, meets, posts. Sign in to read yours.
          </p>
          <div className="mt-6">
            <Link to="/sign-in?redirect=/feed">
              <PWButton>Sign in</PWButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter pb-14">
      <SEOHead
        title="Feed"
        description="See what people you follow are up to — new photos, builds, meets, and posts."
      />

      <PageHeader
        kicker="Session log"
        title="ACTIVITY"
        right={
          <div className="text-right font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            <div>{events.length} events</div>
            <div className="mt-1">Newest first</div>
          </div>
        }
      />

      <div className="border-t border-accent">
        {loading && !initialLoaded ? (
          <div className="space-y-px p-6 md:p-11">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[62px] animate-pulse bg-bg-surface" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <>
            {events.map((event) => (
              <LogLine
                key={event.id}
                event={event}
                rsvped={!!event.entity_id && rsvps.has(event.entity_id)}
                onToggleRsvp={toggleRsvp}
              />
            ))}
            {hasMore && (
              <div className="flex items-center gap-4 px-6 py-5 md:px-11">
                <PWButton
                  variant="secondary"
                  onClick={() => fetchFeed(events.length)}
                  disabled={loading}
                >
                  {loading ? "Loading…" : "Load more"}
                </PWButton>
              </div>
            )}
          </>
        ) : (
          <div className="px-6 py-10 md:px-11">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              No events on the log
            </p>
            <p className="mt-3 max-w-[460px] text-sm leading-relaxed text-text-secondary">
              Follow photographers, builders, and community members to see
              their activity here.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link to="/photos">
                <PWButton variant="secondary">Discover photographers</PWButton>
              </Link>
              <Link
                to="/builds"
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary transition-colors duration-100 hover:text-accent"
              >
                Browse builds
              </Link>
              <Link
                to="/meets"
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary transition-colors duration-100 hover:text-accent"
              >
                Find meets
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
