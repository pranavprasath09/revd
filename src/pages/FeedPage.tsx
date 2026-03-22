import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";
import useFeed from "@/hooks/useFeed";
import type { FeedEvent } from "@/types/notification";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function eventDescription(event: FeedEvent): string {
  switch (event.event_type) {
    case "new_album":
      return "posted a new photo album";
    case "new_build_entry":
      return "added a new build entry";
    case "new_meet":
      return "created a new meet";
    case "new_post":
      return "published a new post";
    default:
      return "did something";
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

function eventIcon(type: string) {
  switch (type) {
    case "new_album":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
        </svg>
      );
    case "new_build_entry":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case "new_meet":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      );
    case "new_post":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
        </svg>
      );
    default:
      return null;
  }
}

function FeedCard({ event }: { event: FeedEvent }) {
  const link = eventLink(event);
  const title = (event.metadata?.title as string) ?? null;
  const previewImage = (event.metadata?.preview_image as string) ?? null;

  const cardContent = (
    <div className="group rounded-xl border border-white/10 bg-bg-surface overflow-hidden transition-all duration-300 hover:border-accent-red/30 hover:shadow-lg hover:shadow-accent-red/5">
      <div className="flex gap-4 p-4">
        {/* Actor avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-elevated border border-white/10">
          <span className="font-mono text-sm font-bold text-text-muted">
            {event.actor?.display_name?.charAt(0)?.toUpperCase() ?? "?"}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm text-text-primary leading-relaxed">
            <span className="font-bold">
              {event.actor?.display_name ?? "Someone"}
            </span>{" "}
            <span className="text-text-secondary">
              {eventDescription(event)}
            </span>
          </p>

          {title && (
            <p className="mt-1 font-display text-lg uppercase tracking-wide text-text-primary leading-tight group-hover:text-accent-red transition-colors">
              {title}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2 text-text-muted">
            <span className="text-accent-red">
              {eventIcon(event.event_type)}
            </span>
            <span className="font-body text-xs">{timeAgo(event.created_at)}</span>
          </div>
        </div>

        {/* Preview image */}
        {previewImage && (
          <div className="hidden sm:block h-20 w-28 shrink-0 overflow-hidden rounded-lg">
            <img
              src={previewImage}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );

  return link ? (
    <Link to={link}>{cardContent}</Link>
  ) : (
    cardContent
  );
}

export default function FeedPage() {
  const { user } = useAuthContext();
  const { events, loading, hasMore, fetchFeed } = useFeed();
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    if (user && !initialLoaded) {
      fetchFeed(0).then(() => setInitialLoaded(true));
    }
  }, [user, fetchFeed, initialLoaded]);

  // Auth gate
  if (!user) {
    return (
      <div className="page-enter">
        <SEOHead title="Feed" description="Your personalized activity feed on RevD." />
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
            Sign in to see activity from people you follow.
          </p>
          <Link
            to="/sign-in?redirect=/feed"
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
        title="Feed"
        description="See what people you follow are up to — new photos, builds, meets, and posts."
      />

      {/* Header */}
      <div className="border-b border-border bg-bg-surface/50">
        <PageWrapper>
          <div className="py-10 sm:py-14">
            <p className="font-body text-[11px] font-bold uppercase tracking-widest text-accent-red mb-3">
              Your Feed
            </p>
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-text-primary leading-none">
              Activity
            </h1>
            <p className="font-body mt-3 max-w-2xl text-base text-text-secondary leading-relaxed">
              Updates from people you follow — new photos, build entries, meets, and posts.
            </p>
          </div>
        </PageWrapper>
      </div>

      {/* Content */}
      <PageWrapper>
        <div className="max-w-2xl py-8">
          {loading && !initialLoaded ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl bg-bg-surface"
                />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <FeedCard key={event.id} event={event} />
              ))}

              {hasMore && (
                <button
                  onClick={() => fetchFeed(events.length)}
                  disabled={loading}
                  className="w-full rounded-lg border border-white/10 bg-bg-surface py-3 font-body text-sm text-text-secondary transition-colors hover:border-accent-red/30 hover:text-text-primary disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              )}
            </div>
          ) : (
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
                    d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                  />
                </svg>
              </div>
              <h2 className="font-display text-2xl uppercase tracking-wide text-text-primary mb-2">
                Your Feed Is Empty
              </h2>
              <p className="font-body text-sm text-text-secondary max-w-md mb-6">
                Follow photographers, builders, and community members to see their activity here.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/photos"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-5 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
                >
                  Discover Photographers
                </Link>
                <Link
                  to="/builds"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-bg-surface px-5 py-3 font-body text-sm font-bold uppercase tracking-wider text-text-primary transition-colors hover:border-accent-red/30"
                >
                  Browse Builds
                </Link>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <Link to="/meets" className="font-body text-sm text-text-secondary hover:text-accent-red transition-colors">
                  Find Meets
                </Link>
                <span className="text-text-muted">·</span>
                <Link to="/communities" className="font-body text-sm text-text-secondary hover:text-accent-red transition-colors">
                  Communities
                </Link>
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}
