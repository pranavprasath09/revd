import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import usePhotos from "@/hooks/usePhotos";
import useFeaturedPhotographer from "@/hooks/useFeaturedPhotographer";
import { supabase } from "@/lib/supabase";
import SectionRule from "@/components/margin/SectionRule";
import PlateGrid, { type Plate } from "@/components/margin/PlateGrid";
import PWButton from "@/components/pitwall/Button";
import type { Album } from "@/types/photo";

const fallbackImage =
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80";

/** The working rhythm from the prototype — never a uniform grid. */
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

export default function PhotosPage() {
  const { user } = useAuthContext();
  const { loading, fetchAlbums } = usePhotos();
  const { featured } = useFeaturedPhotographer();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [creatorNames, setCreatorNames] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAlbums().then(setAlbums);
  }, [fetchAlbums]);

  // Creator names for the plate bylines
  useEffect(() => {
    if (albums.length === 0) return;
    let stale = false;
    const creatorIds = [...new Set(albums.map((a) => a.creator_id))];
    supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", creatorIds)
      .then(({ data, error }) => {
        if (stale || error || !data) return;
        const names: Record<string, string> = {};
        data.forEach((p) => {
          names[p.id] = p.display_name ?? "Anonymous";
        });
        setCreatorNames(names);
      });
    return () => {
      stale = true;
    };
  }, [albums]);

  const plates: Plate[] = useMemo(
    () =>
      albums.map((album, i) => {
        const shape = RHYTHM[i % RHYTHM.length];
        return {
          key: album.id,
          image: album.cover_image || fallbackImage,
          span: shape.span,
          ratio: shape.ratio,
          num: String(i + 1).padStart(2, "0"),
          title: album.title,
          byline: creatorNames[album.creator_id] ?? "—",
          to: `/photos/${album.id}`,
        };
      }),
    [albums, creatorNames],
  );

  return (
    <div className="page-enter px-6 pb-[72px] pt-12 md:px-14">
      <SEOHead
        title="Photos"
        description="Explore stunning car photography from the RevD community. Albums, shoots, and automotive art."
        canonicalUrl="https://revhub.com/photos"
      />

      {/* Featured photographer */}
      {featured && (
        <div className="mb-10 grid gap-12 border-b border-accent pb-11 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-accent">
              Featured photographer
            </div>
            <h1 className="mt-3.5 font-editorial text-[40px] font-normal leading-none tracking-[-0.015em] text-text-primary md:text-[62px]">
              {featured.display_name ?? "Anonymous"}
            </h1>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary">
              {featured.follower_count.toLocaleString()} followers ·{" "}
              {featured.album_count} albums
            </p>
            {featured.bio && (
              <p className="mt-5 max-w-[460px] font-editorial text-[19px] italic leading-[1.5] text-text-primary">
                “{featured.bio}”
              </p>
            )}
            <Link
              to={`/profile/${featured.profile_id}`}
              className="mt-[26px] w-fit border-b border-accent pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-text-primary transition-colors duration-100 hover:text-accent"
            >
              View portfolio →
            </Link>
          </div>
          {featured.recent_covers.length > 0 && (
            <div className="grid grid-cols-[2fr_1fr] gap-2.5">
              <img
                src={featured.recent_covers[0] ?? fallbackImage}
                alt={`Recent work by ${featured.display_name ?? "the featured photographer"}`}
                className="block h-full w-full object-cover"
              />
              <div className="grid grid-rows-2 gap-2.5">
                {[1, 2].map((i) => (
                  <img
                    key={i}
                    src={
                      featured.recent_covers[i] ??
                      featured.recent_covers[0] ??
                      fallbackImage
                    }
                    alt=""
                    loading="lazy"
                    className="block h-full w-full object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* The plates */}
      <div className="flex flex-col gap-6 pb-6 md:flex-row md:items-baseline">
        <div className="min-w-0 flex-1">
          <SectionRule title="The Plates" note="Click to enlarge" />
        </div>
        <Link
          to={user ? "/photos/create" : "/sign-in?redirect=/photos/create"}
          className="shrink-0 md:pl-6"
        >
          <PWButton variant="secondary">Publish an album</PWButton>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-6">
          <div className="col-span-2 h-64 animate-pulse bg-bg-surface lg:col-span-3" />
          <div className="col-span-2 h-64 animate-pulse bg-bg-surface lg:col-span-3" />
        </div>
      ) : plates.length > 0 ? (
        <PlateGrid plates={plates} />
      ) : (
        <div className="py-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            No plates published yet
          </p>
          <p className="mt-3 max-w-[460px] text-sm leading-relaxed text-text-secondary">
            The first album published here becomes plate 01.
          </p>
        </div>
      )}
    </div>
  );
}
