import { Link } from "react-router-dom";
import { Camera, Users, ArrowRight } from "lucide-react";
import useFeaturedPhotographer from "@/hooks/useFeaturedPhotographer";

/**
 * Sprint 8 — Featured Photographer hero on the photos page.
 * Renders nothing while loading or when the community has no photographers
 * yet, so the page never shows an empty shell.
 */
export default function FeaturedPhotographer() {
  const { featured, loading } = useFeaturedPhotographer();

  if (loading || !featured) return null;

  const name = featured.display_name ?? "Anonymous";

  return (
    <section className="mb-8 overflow-hidden rounded-xl border border-border bg-bg-surface">
      <div className="flex flex-col md:flex-row">
        {/* Info panel */}
        <div className="flex flex-1 flex-col justify-center p-6 sm:p-8">
          <p className="font-body text-[11px] font-bold uppercase tracking-widest text-accent-red mb-3">
            Featured Photographer
          </p>

          <div className="flex items-center gap-4">
            {featured.avatar_url ? (
              <img
                src={featured.avatar_url}
                alt={name}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
                className="h-14 w-14 shrink-0 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bg-elevated border border-border">
                <Camera className="h-6 w-6 text-text-muted" />
              </div>
            )}
            <div>
              <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-text-primary leading-none">
                {name}
              </h2>
              <div className="mt-1.5 flex items-center gap-4 font-body text-xs text-text-secondary">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {featured.follower_count}{" "}
                  {featured.follower_count === 1 ? "follower" : "followers"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5" />
                  {featured.album_count}{" "}
                  {featured.album_count === 1 ? "album" : "albums"}
                </span>
              </div>
            </div>
          </div>

          {featured.bio && (
            <p className="font-body mt-4 max-w-xl text-sm text-text-secondary leading-relaxed line-clamp-2">
              {featured.bio}
            </p>
          )}

          <Link
            to={`/profile/${featured.profile_id}`}
            className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-accent-red px-5 py-2.5 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
          >
            View Portfolio
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Recent covers strip */}
        {featured.recent_covers.length > 0 && (
          <div className="flex h-40 md:h-auto md:w-2/5">
            {featured.recent_covers.map((cover, i) => (
              <div
                key={cover}
                className={`relative flex-1 overflow-hidden ${i > 0 ? "hidden sm:block" : ""}`}
              >
                <img
                  src={cover}
                  alt={`Recent work by ${name}`}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
