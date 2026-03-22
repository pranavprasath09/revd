import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";
import usePhotos from "@/hooks/usePhotos";
import { supabase } from "@/lib/supabase";
import type { Album, AlbumPhoto } from "@/types/photo";

export default function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { fetchAlbum, fetchAlbumPhotos, deleteAlbum, followUser, unfollowUser, isFollowing } = usePhotos();

  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [creatorUsername, setCreatorUsername] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch album + photos
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchAlbum(id), fetchAlbumPhotos(id)])
      .then(([albumData, photosData]) => {
        setAlbum(albumData);
        setPhotos(photosData);
      })
      .catch((err) => {
        console.error("Failed to load album:", err);
      })
      .finally(() => setLoading(false));
  }, [id, fetchAlbum, fetchAlbumPhotos]);

  // Fetch creator info
  useEffect(() => {
    if (!album) return;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", album.creator_id)
      .single()
      .then(({ data }) => {
        setCreatorName(data?.display_name ?? "Anonymous");
        setCreatorUsername(album.creator_id);
      });
  }, [album]);

  // Check follow status
  useEffect(() => {
    if (!album || !user) return;
    isFollowing(album.creator_id).then(setFollowing);
  }, [album, user, isFollowing]);

  async function handleFollow() {
    if (!album || !user) return;
    setFollowLoading(true);
    if (following) {
      const ok = await unfollowUser(album.creator_id);
      if (ok) setFollowing(false);
    } else {
      const ok = await followUser(album.creator_id);
      if (ok) setFollowing(true);
    }
    setFollowLoading(false);
  }

  const fallbackImage =
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80";

  // Loading
  if (loading) {
    return (
      <div className="page-enter">
        <div className="h-16 animate-pulse bg-bg-surface" />
        <PageWrapper>
          <div className="space-y-4 py-8">
            <div className="h-10 w-2/3 animate-pulse rounded-lg bg-bg-surface" />
            <div className="h-6 w-1/3 animate-pulse rounded-lg bg-bg-surface" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square animate-pulse rounded-lg bg-bg-surface" />
              ))}
            </div>
          </div>
        </PageWrapper>
      </div>
    );
  }

  // Not found
  if (!album) {
    return (
      <div className="page-enter">
        <SEOHead title="Album Not Found" description="This album doesn't exist." />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="font-mono text-6xl font-black text-text-muted">404</div>
          <h1 className="font-display mt-4 text-2xl uppercase tracking-wide text-text-primary">
            Album not found
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            This album may have been removed or the link is incorrect.
          </p>
          <Link
            to="/photos"
            className="mt-6 rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
          >
            Browse Photos
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === album.creator_id;

  return (
    <div className="page-enter">
      <SEOHead
        title={`${album.title} — Photos on RevD`}
        description={album.description || `Photo album by ${creatorName ?? "a RevD photographer"}. ${photos.length} photos.`}
        ogImage={album.cover_image || fallbackImage}
      />

      {/* Header */}
      <div className="border-b border-border bg-bg-surface/50">
        <PageWrapper>
          <div className="py-10 sm:py-14">
            <Link
              to="/photos"
              className="font-body text-sm text-text-secondary hover:text-accent-red transition-colors inline-flex items-center gap-1 mb-4"
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
              All Photos
            </Link>

            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-text-primary leading-none">
              {album.title}
            </h1>

            {album.description && (
              <p className="font-body mt-3 max-w-3xl text-base text-text-secondary leading-relaxed">
                {album.description}
              </p>
            )}

            {/* Photographer info + follow */}
            <div className="mt-6 flex items-center gap-4">
              <Link
                to={`/profile/${creatorUsername ?? ""}`}
                className="flex items-center gap-3 group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-red/20 border border-accent-red/30">
                  <span className="font-body text-sm font-bold text-accent-red">
                    {(creatorName ?? "?")[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-text-primary group-hover:text-accent-red transition-colors">
                    {creatorName ?? "..."}
                  </p>
                  <p className="font-body text-xs text-text-muted">
                    {photos.length} {photos.length === 1 ? "photo" : "photos"}
                  </p>
                </div>
              </Link>

              {user && !isOwner && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`rounded-lg px-4 py-2 font-body text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    following
                      ? "border border-white/10 text-text-secondary hover:border-accent-red/40 hover:text-accent-red"
                      : "bg-accent-red text-white hover:bg-accent-hover"
                  }`}
                >
                  {followLoading ? "..." : following ? "Following" : "Follow"}
                </button>
              )}
            </div>

            {/* Car tags */}
            {album.car_tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {album.car_tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-accent-red/10 px-3 py-1 font-body text-[11px] font-bold uppercase tracking-wider text-accent-red"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Owner actions */}
            {isOwner && (
              <div className="mt-6">
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 font-body text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Album
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2">
                    <span className="font-body text-xs text-red-400">Delete this album permanently?</span>
                    <button
                      onClick={async () => {
                        setDeleting(true);
                        const ok = await deleteAlbum(album.id);
                        if (ok) {
                          navigate("/photos");
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
        </PageWrapper>
      </div>

      {/* Photo Grid */}
      <PageWrapper>
        <div className="py-8">
          {photos.length > 0 ? (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="mb-4 break-inside-avoid cursor-pointer group"
                  onClick={() => setLightboxIndex(index)}
                >
                  <div className="relative overflow-hidden rounded-lg border border-white/5">
                    <img
                      src={photo.image_url}
                      alt={photo.caption || `Photo ${index + 1}`}
                      loading="lazy"
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    {photo.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-base/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="font-body text-sm text-white">{photo.caption}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-12 text-center font-body text-sm text-text-muted">
              No photos in this album yet.
            </p>
          )}
        </div>
      </PageWrapper>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/95 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Prev/Next */}
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
              className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {lightboxIndex < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
              className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <img
            src={photos[lightboxIndex].image_url}
            alt={photos[lightboxIndex].caption || ""}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
