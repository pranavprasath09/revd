import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";
import usePhotos from "@/hooks/usePhotos";
import { supabase } from "@/lib/supabase";
import type { Album } from "@/types/photo";

interface AlbumCardProps {
  album: Album;
  creatorName: string | null;
}

function AlbumCard({ album, creatorName }: AlbumCardProps) {
  const fallbackImage =
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80";

  return (
    <Link
      to={`/photos/${album.id}`}
      className="group block rounded-xl border border-white/10 bg-bg-surface overflow-hidden transition-all duration-300 hover:border-accent-red/30 hover:shadow-lg hover:shadow-accent-red/5 break-inside-avoid mb-5"
    >
      <div className="relative overflow-hidden">
        <img
          src={album.cover_image || fallbackImage}
          alt={album.title}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg uppercase tracking-wide text-text-primary leading-tight group-hover:text-accent-red transition-colors">
          {album.title}
        </h3>

        <p className="mt-1.5 font-body text-xs text-text-secondary">
          by{" "}
          <span className="text-text-primary font-medium">
            {creatorName ?? "Anonymous"}
          </span>
        </p>

        {album.car_tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {album.car_tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent-red/10 px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-accent-red"
              >
                {tag}
              </span>
            ))}
            {album.car_tags.length > 3 && (
              <span className="rounded-full bg-bg-elevated px-2.5 py-0.5 font-body text-[10px] font-bold text-text-muted">
                +{album.car_tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function PhotosPage() {
  const { user } = useAuthContext();
  const { loading, fetchAlbums } = usePhotos();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [creatorNames, setCreatorNames] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAlbums().then(setAlbums);
  }, [fetchAlbums]);

  // Fetch creator names for all albums
  useEffect(() => {
    if (albums.length === 0) return;
    const creatorIds = [...new Set(albums.map((a) => a.creator_id))];

    supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", creatorIds)
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to fetch creator names:", error.message);
          return;
        }
        if (!data) return;
        const names: Record<string, string> = {};
        data.forEach((p) => {
          names[p.id] = p.display_name ?? "Anonymous";
        });
        setCreatorNames(names);
      });
  }, [albums]);

  return (
    <div className="page-enter">
      <SEOHead
        title="Photos"
        description="Explore stunning car photography from the RevD community. Albums, shoots, and automotive art."
        canonicalUrl="https://revhub.com/photos"
      />

      {/* Header */}
      <div className="border-b border-border bg-bg-surface/50">
        <PageWrapper>
          <div className="py-10 sm:py-14">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-body text-[11px] font-bold uppercase tracking-widest text-accent-red mb-3">
                  Gallery
                </p>
                <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-text-primary leading-none">
                  Photos
                </h1>
                <p className="font-body mt-3 max-w-2xl text-base text-text-secondary leading-relaxed">
                  Car photography from the community. Shoots, builds, meets — captured by enthusiasts.
                </p>
              </div>

              {user && (
                <Link
                  to="/photos/create"
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
                  New Album
                </Link>
              )}
            </div>
          </div>
        </PageWrapper>
      </div>

      {/* Content */}
      <PageWrapper>
        <div className="py-8">
          {loading ? (
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="mb-5 animate-pulse rounded-xl bg-bg-surface break-inside-avoid"
                  style={{ height: `${200 + (i % 3) * 80}px` }}
                />
              ))}
            </div>
          ) : albums.length > 0 ? (
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  creatorName={creatorNames[album.creator_id] ?? null}
                />
              ))}
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
                    d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
                  />
                </svg>
              </div>
              <h2 className="font-display text-2xl uppercase tracking-wide text-text-primary mb-2">
                No Albums Yet
              </h2>
              <p className="font-body text-sm text-text-secondary max-w-md mb-6">
                Be the first to share your car photography with the community.
              </p>
              {user ? (
                <Link
                  to="/photos/create"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
                >
                  Create the First Album
                </Link>
              ) : (
                <Link
                  to="/sign-in?redirect=/photos"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
                >
                  Sign In to Upload
                </Link>
              )}
              <div className="mt-6 flex items-center gap-4">
                <Link to="/meets" className="font-body text-sm text-text-secondary hover:text-accent-red transition-colors">
                  Find Meets
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
