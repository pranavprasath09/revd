import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import usePhotos from "@/hooks/usePhotos";
import { supabase } from "@/lib/supabase";
import PlateGrid, { type Plate } from "@/components/margin/PlateGrid";
import { ToggleButton } from "@/components/pitwall/Button";
import { longDate } from "@/lib/time";
import type { Album, AlbumPhoto } from "@/types/photo";

/** The irregular rhythm, applied to the album's plates. */
const RHYTHM: { span: Plate["span"]; ratio: string }[] = [
  { span: 3, ratio: "3 / 2" },
  { span: 3, ratio: "3 / 2" },
  { span: 2, ratio: "4 / 5" },
  { span: 2, ratio: "4 / 5" },
  { span: 2, ratio: "4 / 5" },
  { span: 4, ratio: "16 / 9" },
  { span: 2, ratio: "1 / 1" },
  { span: 6, ratio: "21 / 9" },
];

export default function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const {
    fetchAlbum,
    fetchAlbumPhotos,
    deleteAlbum,
    followUser,
    unfollowUser,
    isFollowing,
  } = usePhotos();

  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let stale = false;
    setLoading(true);
    Promise.all([fetchAlbum(id), fetchAlbumPhotos(id)])
      .then(([albumData, photosData]) => {
        if (stale) return;
        setAlbum(albumData);
        setPhotos(photosData);
      })
      .catch((err) => console.error("Failed to load album:", err))
      .finally(() => {
        if (!stale) setLoading(false);
      });
    return () => {
      stale = true;
    };
  }, [id, fetchAlbum, fetchAlbumPhotos]);

  useEffect(() => {
    if (!album) return;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", album.creator_id)
      .single()
      .then(({ data }) => {
        setCreatorName(data?.display_name ?? "Anonymous");
      });
  }, [album]);

  useEffect(() => {
    if (!album || !user) return;
    let stale = false;
    isFollowing(album.creator_id).then((f) => {
      if (!stale) setFollowing(f);
    });
    return () => {
      stale = true;
    };
  }, [album, user, isFollowing]);

  async function handleFollow() {
    if (!album) return;
    if (!user) {
      navigate(`/sign-in?redirect=/photos/${id}`);
      return;
    }
    setFollowLoading(true);
    if (following) {
      const ok = await unfollowUser(album.creator_id);
      setFollowing(ok ? false : await isFollowing(album.creator_id));
    } else {
      const ok = await followUser(album.creator_id);
      setFollowing(ok ? true : await isFollowing(album.creator_id));
    }
    setFollowLoading(false);
  }

  const plates: Plate[] = useMemo(
    () =>
      photos.map((p, i) => {
        const shape = RHYTHM[i % RHYTHM.length];
        return {
          key: p.id,
          image: p.image_url,
          span: shape.span,
          ratio: shape.ratio,
          num: String(i + 1).padStart(2, "0"),
          title: p.caption || p.car_tag || `Plate ${String(i + 1).padStart(2, "0")}`,
        };
      }),
    [photos],
  );

  if (loading) {
    return (
      <div className="page-enter px-6 py-12 md:px-14">
        <div className="h-12 w-2/3 animate-pulse bg-bg-surface" />
        <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-6">
          <div className="col-span-2 h-64 animate-pulse bg-bg-surface lg:col-span-3" />
          <div className="col-span-2 h-64 animate-pulse bg-bg-surface lg:col-span-3" />
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="page-enter px-6 pb-20 pt-12 md:px-14">
        <SEOHead title="Album Not Found" description="This album doesn't exist." />
        <h1 className="font-editorial text-[62px] font-normal leading-none text-text-primary">
          Not found
        </h1>
        <p className="mt-4 max-w-[460px] font-editorial text-lg italic text-text-secondary">
          This album may have been removed, or the link is wrong.
        </p>
        <Link
          to="/photos"
          className="mt-7 inline-block border-b border-accent pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-text-primary hover:text-accent"
        >
          Back to the plates →
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === album.creator_id;

  return (
    <div className="page-enter px-6 pb-20 pt-12 md:px-14">
      <SEOHead
        title={album.title}
        description={album.description ?? `${album.title} — a photo album on RevD.`}
        ogImage={album.cover_image ?? undefined}
      />

      {/* Album header */}
      <div className="grid items-end gap-8 border-b border-accent pb-[30px] lg:grid-cols-[1fr_340px] lg:gap-14">
        <div>
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.24em] text-text-secondary">
            <Link to="/photos" className="hover:text-accent">
              Photos
            </Link>
            <span className="text-text-muted">/</span>
            <span className="text-accent">Album</span>
          </div>
          <h1 className="mt-3.5 font-editorial text-[40px] font-normal leading-none tracking-[-0.015em] text-text-primary md:text-[62px]">
            {album.title}
          </h1>
          {album.description && (
            <p className="mt-3.5 max-w-[520px] font-editorial text-lg italic text-text-secondary">
              {album.description}
            </p>
          )}
          {album.car_tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              {album.car_tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="font-mono text-[10px] uppercase leading-loose tracking-[0.16em] text-text-secondary lg:text-right">
          <Link
            to={`/profile/${album.creator_id}`}
            className="text-text-primary hover:text-accent"
          >
            {creatorName ?? "—"}
          </Link>
          <br />
          {photos.length} plates
          <br />
          {longDate(album.created_at)}
        </div>
      </div>

      {/* The plates */}
      {plates.length > 0 ? (
        <div className="pt-[34px]">
          <PlateGrid plates={plates} captionStyle="italic" />
        </div>
      ) : (
        <p className="py-10 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
          No plates in this album
        </p>
      )}

      {/* Photographer footer */}
      <div className="mt-11 grid items-center gap-10 border-t border-border-alpha pt-[30px] md:grid-cols-2">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-accent">
            The photographer
          </div>
          <p className="mt-3 font-editorial text-[34px] text-text-primary">
            {creatorName ?? "—"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-5 md:justify-end">
          {!isOwner && (
            <ToggleButton on={following} disabled={followLoading} onClick={handleFollow}>
              {following ? "Following" : "Follow"}
            </ToggleButton>
          )}
          <Link
            to={`/profile/${album.creator_id}`}
            className="border-b border-accent pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-text-primary transition-colors duration-100 hover:text-accent"
          >
            View portfolio →
          </Link>
          {isOwner &&
            (!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted transition-colors duration-100 hover:text-signal-red"
              >
                Delete album
              </button>
            ) : (
              <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em]">
                <button
                  disabled={deleting}
                  onClick={async () => {
                    setDeleting(true);
                    const ok = await deleteAlbum(album.id);
                    if (ok) navigate("/photos");
                    else setDeleting(false);
                  }}
                  className="cursor-pointer text-signal-red hover:opacity-80"
                >
                  {deleting ? "Deleting…" : "Confirm delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="cursor-pointer text-text-secondary hover:text-text-primary"
                >
                  Keep it
                </button>
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}
