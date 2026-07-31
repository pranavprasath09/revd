import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import usePhotos from "@/hooks/usePhotos";
import { supabase } from "@/lib/supabase";
import OpeningSpread from "@/components/margin/OpeningSpread";
import FolioStats from "@/components/margin/FolioStats";
import SectionRule from "@/components/margin/SectionRule";
import IndexList, {
  IdxAccent,
  IdxMono,
  IdxMuted,
  IdxName,
  IdxNum,
} from "@/components/margin/IndexList";
import { ToggleButton } from "@/components/pitwall/Button";
import { CARS, carPath } from "@/lib/carData";
import { longDate } from "@/lib/time";
import type { Car } from "@/types/car";
import type { Album } from "@/types/photo";

const fallbackImage =
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80";

function carById(carId: string): Car | undefined {
  return CARS.find((c) => c.id === carId || c.slug === carId);
}

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  tier: string;
  is_premium: boolean;
}

interface GarageCarRow {
  id: string;
  car_id: string;
  nickname: string | null;
  year: string | null;
  notes: string | null;
  mods: { id: string; name: string; cost?: string }[] | null;
}

interface MeetRow {
  id: string;
  name: string;
  date: string;
  meet_type: string | null;
  cover_image_url: string | null;
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuthContext();
  const { fetchUserAlbums, followUser, unfollowUser, isFollowing, getFollowerCount } =
    usePhotos();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [garageCars, setGarageCars] = useState<GarageCarRow[]>([]);
  const [rsvpMeets, setRsvpMeets] = useState<MeetRow[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Find profile by id first, then fall back to case-insensitive display_name
  useEffect(() => {
    if (!username) return;
    let stale = false;
    setLoading(true);

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        username,
      );

    if (isUuid) {
      supabase
        .from("profiles")
        .select("id, display_name, avatar_url, bio, tier, is_premium")
        .eq("id", username)
        .single()
        .then(({ data, error }) => {
          if (stale) return;
          if (error && error.code !== "PGRST116")
            console.error("Profile fetch error:", error.message);
          setProfile(data as Profile | null);
          setLoading(false);
        });
    } else {
      const decoded = decodeURIComponent(username).replace(/-/g, " ");
      // Escape LIKE wildcards so a display name containing % or _ can't match
      // unrelated rows (ilike treats them as patterns).
      const escaped = decoded.replace(/[\\%_]/g, (m) => `\\${m}`);
      supabase
        .from("profiles")
        .select("id, display_name, avatar_url, bio, tier, is_premium")
        .ilike("display_name", escaped)
        .limit(1)
        .single()
        .then(({ data, error }) => {
          if (stale) return;
          if (error && error.code !== "PGRST116")
            console.error("Profile fetch error:", error.message);
          setProfile(data as Profile | null);
          setLoading(false);
        });
    }

    return () => {
      stale = true;
    };
  }, [username]);

  // Load contributor data once the profile is found
  useEffect(() => {
    if (!profile) return;
    let stale = false;

    fetchUserAlbums(profile.id).then((data) => {
      if (!stale) setAlbums(data);
    });
    getFollowerCount(profile.id).then((count) => {
      if (!stale) setFollowerCount(count);
    });
    supabase
      .from("garage_cars")
      .select("id, car_id, nickname, year, notes, mods")
      .eq("user_id", profile.id)
      .limit(60)
      .then(({ data, error }) => {
        if (stale) return;
        if (error) console.error("Failed to load garage:", error.message);
        setGarageCars((data as GarageCarRow[]) ?? []);
      });
    supabase
      .from("meet_rsvps")
      .select("meet_id, meets(id, name, date, meet_type, cover_image_url)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(60)
      .then(({ data, error }) => {
        if (stale) return;
        if (error) {
          console.error("Failed to load meets:", error.message);
          return;
        }
        if (!data) return;
        const meets = (data as unknown as { meets: MeetRow | null }[])
          .map((r) => r.meets)
          .filter(Boolean) as MeetRow[];
        setRsvpMeets(meets);
      });

    if (user) {
      isFollowing(profile.id).then((f) => {
        if (!stale) setFollowing(f);
      });
    }

    return () => {
      stale = true;
    };
  }, [profile, user, fetchUserAlbums, getFollowerCount, isFollowing]);

  async function handleFollow() {
    if (!profile || !user) return;
    setFollowLoading(true);
    if (following) {
      const ok = await unfollowUser(profile.id);
      if (ok) {
        setFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
      } else {
        setFollowing(await isFollowing(profile.id));
      }
    } else {
      const ok = await followUser(profile.id);
      if (ok) {
        setFollowing(true);
        setFollowerCount((c) => c + 1);
      } else {
        setFollowing(await isFollowing(profile.id));
      }
    }
    setFollowLoading(false);
  }

  const garageIndex = useMemo(
    () =>
      garageCars.map((gc, i) => {
        const car = carById(gc.car_id);
        return {
          key: gc.id,
          image: car?.heroImage ?? fallbackImage,
          to: car ? carPath(car) : undefined,
          num: String(i + 1).padStart(2, "0"),
          name: gc.nickname
            ? gc.nickname
            : car
              ? `${car.make} ${car.model}`
              : "Unknown car",
          gen: car?.generation ?? "—",
          years: gc.year ?? car?.years ?? "",
          power: car?.engines[0]?.power ?? "",
          car,
          gc,
        };
      }),
    [garageCars],
  );

  if (loading) {
    return (
      <div className="page-enter px-6 py-12 md:px-14">
        <div className="h-14 w-1/2 animate-pulse bg-bg-surface" />
        <div className="mt-8 h-72 animate-pulse bg-bg-surface" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-enter px-6 pb-20 pt-12 md:px-14">
        <SEOHead title="Profile Not Found" description="This member doesn't exist." />
        <h1 className="font-editorial text-[62px] font-normal leading-none text-text-primary">
          Not found
        </h1>
        <p className="mt-4 max-w-[460px] font-editorial text-lg italic text-text-secondary">
          No contributor by that name.
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

  const displayName = profile.display_name ?? "Anonymous";
  const isOwnProfile = user?.id === profile.id;
  const bestImage =
    albums.find((a) => a.cover_image)?.cover_image ??
    garageIndex[0]?.image ??
    fallbackImage;

  return (
    <div className="page-enter pb-20">
      <SEOHead
        title={displayName}
        description={profile.bio ?? `${displayName}'s portfolio on RevD.`}
        ogImage={bestImage}
      />

      <OpeningSpread
        kicker={profile.is_premium ? "Contributor · PRO" : "Contributor"}
        headline={displayName}
        standfirst={
          <>
            <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary">
              {followerCount.toLocaleString()} followers · {albums.length}{" "}
              albums · {garageCars.length}{" "}
              {garageCars.length === 1 ? "car" : "cars"}
            </span>
            {profile.bio && (
              <span className="mt-5 block font-editorial text-[19px] italic leading-[1.5] text-text-primary">
                “{profile.bio}”
              </span>
            )}
          </>
        }
        actions={
          !isOwnProfile ? (
            <ToggleButton
              on={following}
              disabled={followLoading}
              onClick={() => {
                if (!user) return;
                handleFollow();
              }}
              className="px-6 py-3 text-[10px] tracking-[0.2em]"
            >
              {user ? (following ? "Following" : "Follow") : "Sign in to follow"}
            </ToggleButton>
          ) : (
            <Link
              to="/garage"
              className="border-b border-accent pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-text-primary hover:text-accent"
            >
              Open your garage →
            </Link>
          )
        }
        image={bestImage}
        alt={`Work by ${displayName}`}
        caption={
          albums[0] ? `Plate one, ${albums[0].title}.` : undefined
        }
      />

      <FolioStats
        stats={[
          { value: followerCount.toLocaleString(), label: "Followers" },
          { value: String(albums.length), label: "Albums" },
          { value: String(garageCars.length), label: "Cars on file" },
          { value: String(rsvpMeets.length), label: "Meets attended" },
        ]}
      />

      <div className="pl-6 md:pl-14 lg:pr-14">
        {/* The Garage — the index pattern */}
        <div className="pr-6 pt-11 lg:pr-0">
          <SectionRule
            title="The Garage"
            note={
              garageIndex.length
                ? `${garageIndex.length} ${garageIndex.length === 1 ? "car" : "cars"} on file`
                : "Empty"
            }
          />
        </div>
        {garageIndex.length === 0 ? (
          <p className="py-6 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            No cars on file
          </p>
        ) : (
          <IndexList
            items={garageIndex}
            gridTemplate="46px 1fr 74px 116px 74px"
            rowPadding={15}
            renderCells={(r) => (
              <>
                <IdxNum>{r.num}</IdxNum>
                <IdxName size={27}>{r.name}</IdxName>
                <IdxAccent>{r.gen}</IdxAccent>
                <IdxMuted>{r.years}</IdxMuted>
                <IdxMono right>{r.power}</IdxMono>
              </>
            )}
            renderPanel={(r) => (
              <>
                <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-accent">
                  In the garage
                </div>
                <p className="mt-2.5 font-editorial text-[28px] leading-[1.12] text-text-primary">
                  {r.car ? `${r.car.make} ${r.car.model}` : r.name}
                </p>
                <p className="mt-1.5 font-editorial text-[15px] italic text-text-secondary">
                  {r.car
                    ? `${r.car.generation}, ${r.car.years} — ${r.car.engines[0]?.code ?? ""}.`
                    : "Not in the database."}
                </p>
                {r.gc.mods && r.gc.mods.length > 0 && (
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                    {r.gc.mods.length} mods logged
                  </p>
                )}
              </>
            )}
          />
        )}

        {/* Recent albums as plates */}
        <div className="pr-6 pt-11 lg:pr-0">
          <SectionRule title="Recent Albums" note={albums.length ? undefined : "None yet"} />
          {albums.length === 0 ? (
            <p className="py-6 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              No albums published
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-5 pt-5 md:grid-cols-4">
              {albums.slice(0, 4).map((album) => (
                <Link key={album.id} to={`/photos/${album.id}`} className="group block">
                  <img
                    src={album.cover_image || fallbackImage}
                    alt={album.title}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackImage;
                    }}
                    className="block w-full object-cover transition-opacity duration-200 group-hover:opacity-75"
                    style={{ aspectRatio: "4 / 3" }}
                  />
                  <p className="mt-2 font-editorial text-base leading-[1.2] text-text-primary transition-colors duration-150 group-hover:text-accent">
                    {album.title}
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
                    {longDate(album.created_at)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Meets — mono-metadata editorial rows */}
        {rsvpMeets.length > 0 && (
          <div className="pr-6 pt-11 lg:pr-0">
            <SectionRule title="On the Calendar" />
            <div className="pt-2">
              {rsvpMeets.slice(0, 6).map((meet) => (
                <Link
                  key={meet.id}
                  to={`/meets/${meet.id}`}
                  className="group grid grid-cols-[96px_1fr_auto] items-baseline gap-4 border-b border-border-hair py-3.5"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
                    {new Date(meet.date + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="font-editorial text-[21px] leading-[1.15] text-text-primary transition-colors duration-150 group-hover:text-accent">
                    {meet.name}
                  </span>
                  {meet.meet_type && (
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-secondary max-md:hidden">
                      {meet.meet_type}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
