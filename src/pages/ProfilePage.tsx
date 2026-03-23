import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";
import usePhotos from "@/hooks/usePhotos";
import { supabase } from "@/lib/supabase";
import carsData from "@/data/cars.json";
import type { Car } from "@/types/car";
import type { Album } from "@/types/photo";

const cars = carsData as Car[];

function carById(carId: string): Car | undefined {
  return cars.find((c) => c.id === carId || c.slug === carId);
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
  const { fetchUserAlbums, followUser, unfollowUser, isFollowing, getFollowerCount } = usePhotos();

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
    setLoading(true);

    // Try UUID lookup first (direct id link)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);

    if (isUuid) {
      supabase
        .from("profiles")
        .select("id, display_name, avatar_url, bio, tier, is_premium")
        .eq("id", username)
        .single()
        .then(({ data, error }) => {
          if (error && error.code !== "PGRST116") console.error("Profile fetch error:", error.message);
          setProfile(data as Profile | null);
          setLoading(false);
        });
    } else {
      const decoded = decodeURIComponent(username).replace(/-/g, " ");
      supabase
        .from("profiles")
        .select("id, display_name, avatar_url, bio, tier, is_premium")
        .ilike("display_name", decoded)
        .limit(1)
        .single()
        .then(({ data, error }) => {
          if (error && error.code !== "PGRST116") console.error("Profile fetch error:", error.message);
          setProfile(data as Profile | null);
          setLoading(false);
        });
    }
  }, [username]);

  // Load profile data once profile is found
  useEffect(() => {
    if (!profile) return;

    // Albums
    fetchUserAlbums(profile.id).then(setAlbums);

    // Follower count
    getFollowerCount(profile.id).then(setFollowerCount);

    // Garage cars
    supabase
      .from("garage_cars")
      .select("id, car_id, nickname, year, notes, mods")
      .eq("user_id", profile.id)
      .then(({ data, error }) => {
        if (error) console.error("Failed to load garage:", error.message);
        setGarageCars((data as GarageCarRow[]) ?? []);
      });

    // Meets RSVPed to
    supabase
      .from("meet_rsvps")
      .select("meet_id, meets(id, name, date, meet_type, cover_image_url)")
      .eq("user_id", profile.id)
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load meets:", error.message);
          return;
        }
        if (!data) return;
        const meets = data
          .map((r: any) => r.meets as MeetRow | null)
          .filter(Boolean) as MeetRow[];
        setRsvpMeets(meets);
      });

    // Follow status
    if (user) {
      isFollowing(profile.id).then(setFollowing);
    }
  }, [profile, user, fetchUserAlbums, getFollowerCount, isFollowing]);

  async function handleFollow() {
    if (!profile || !user) return;
    setFollowLoading(true);
    if (following) {
      const ok = await unfollowUser(profile.id);
      if (ok) {
        setFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
      }
    } else {
      const ok = await followUser(profile.id);
      if (ok) {
        setFollowing(true);
        setFollowerCount((c) => c + 1);
      }
    }
    setFollowLoading(false);
  }

  const fallbackImage =
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80";

  // Loading
  if (loading) {
    return (
      <div className="page-enter">
        <PageWrapper>
          <div className="py-16 space-y-6">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 animate-pulse rounded-full bg-bg-surface" />
              <div className="space-y-3">
                <div className="h-8 w-48 animate-pulse rounded-lg bg-bg-surface" />
                <div className="h-4 w-32 animate-pulse rounded-lg bg-bg-surface" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-xl bg-bg-surface" />
              ))}
            </div>
          </div>
        </PageWrapper>
      </div>
    );
  }

  // Not found
  if (!profile) {
    return (
      <div className="page-enter">
        <SEOHead title="Profile Not Found" description="This user doesn't exist." />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="font-mono text-6xl font-black text-text-muted">404</div>
          <h1 className="font-display mt-4 text-2xl uppercase tracking-wide text-text-primary">
            User not found
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            This profile doesn't exist or may have been removed.
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

  const isOwnProfile = user?.id === profile.id;
  const displayName = profile.display_name ?? "Anonymous";

  return (
    <div className="page-enter">
      <SEOHead
        title={`${displayName} — RevD`}
        description={profile.bio || `${displayName}'s profile on RevD. ${albums.length} albums, ${garageCars.length} cars.`}
      />

      {/* Profile Header */}
      <div className="border-b border-border bg-bg-surface/50">
        <PageWrapper>
          <div className="py-10 sm:py-14">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-accent-red/20 border-2 border-accent-red/30">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="font-display text-3xl text-accent-red">
                    {displayName[0].toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-text-primary leading-none">
                    {displayName}
                  </h1>
                  {(profile.is_premium || profile.tier === "premium") && (
                    <span className="rounded-full bg-accent-red/10 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-accent-red">
                      PRO
                    </span>
                  )}
                </div>

                {profile.bio && (
                  <p className="mt-2 font-body text-base text-text-secondary max-w-xl leading-relaxed">
                    {profile.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="mt-4 flex items-center gap-6">
                  <div>
                    <span className="font-mono text-lg font-bold text-text-primary">{followerCount}</span>
                    <span className="ml-1.5 font-body text-sm text-text-secondary">
                      {followerCount === 1 ? "follower" : "followers"}
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-lg font-bold text-text-primary">{albums.length}</span>
                    <span className="ml-1.5 font-body text-sm text-text-secondary">
                      {albums.length === 1 ? "album" : "albums"}
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-lg font-bold text-text-primary">{garageCars.length}</span>
                    <span className="ml-1.5 font-body text-sm text-text-secondary">
                      {garageCars.length === 1 ? "car" : "cars"}
                    </span>
                  </div>
                </div>

                {/* Follow button */}
                {user && !isOwnProfile && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`mt-4 rounded-lg px-6 py-2.5 font-body text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      following
                        ? "border border-border text-text-secondary hover:border-accent-red/40 hover:text-accent-red"
                        : "bg-accent-red text-white hover:bg-accent-hover"
                    }`}
                  >
                    {followLoading ? "..." : following ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </PageWrapper>
      </div>

      <PageWrapper>
        <div className="py-8 space-y-12">
          {/* Albums section */}
          <section>
            <h2 className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-4">
              Albums ({albums.length})
            </h2>
            {albums.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {albums.map((album) => (
                  <Link
                    key={album.id}
                    to={`/photos/${album.id}`}
                    className="group rounded-xl border border-border bg-bg-surface overflow-hidden transition-all duration-300 hover:border-accent-red/30"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={album.cover_image || fallbackImage}
                        alt={album.title}
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-lg uppercase tracking-wide text-text-primary group-hover:text-accent-red transition-colors">
                        {album.title}
                      </h3>
                      {album.car_tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {album.car_tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-accent-red/10 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-accent-red"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-bg-surface p-8 text-center">
                <p className="font-body text-sm text-text-muted">No albums yet.</p>
              </div>
            )}
          </section>

          {/* Garage section */}
          <section>
            {isOwnProfile ? (
              <Link
                to="/garage"
                className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-4 inline-flex items-center gap-1.5 hover:text-accent-red transition-colors"
              >
                Garage ({garageCars.length})
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <h3 className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-4">
                Garage ({garageCars.length})
              </h3>
            )}
            {garageCars.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {garageCars.map((gc) => {
                  const car = carById(gc.car_id);
                  const modCount = Array.isArray(gc.mods) ? gc.mods.length : 0;
                  const carFallback = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80";

                  return (
                    <div
                      key={gc.id}
                      className="group rounded-xl border border-border bg-bg-surface overflow-hidden transition-all duration-300 hover:border-accent-red/30 hover:shadow-lg hover:shadow-accent-red/5"
                    >
                      {/* Car hero image */}
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={car?.heroImage || carFallback}
                          alt={car ? `${car.make} ${car.model}` : gc.car_id}
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).src = carFallback; }}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-bg-surface/30 to-transparent" />

                        {/* Mod count badge */}
                        {modCount > 0 && (
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-bg-base/90 px-3 py-1.5 backdrop-blur-sm">
                            <svg className="h-3.5 w-3.5 text-accent-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                            </svg>
                            <span className="font-mono text-sm font-bold text-text-primary">{modCount}</span>
                          </div>
                        )}

                        {/* Name overlay */}
                        <div className="absolute bottom-4 left-4 right-4">
                          {gc.nickname && (
                            <p className="font-body text-xs font-bold uppercase tracking-wider text-accent-red mb-1">
                              {gc.nickname}
                            </p>
                          )}
                          <h3 className="font-display text-xl uppercase tracking-wide text-white leading-tight">
                            {gc.year ?? ""} {car ? `${car.make} ${car.model}` : gc.car_id}
                          </h3>
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-4 space-y-2">
                        {/* Specs row */}
                        {car && (
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="font-mono text-xs text-text-secondary">{car.generation}</span>
                            <span className="text-text-muted">·</span>
                            <span className="font-mono text-xs text-text-secondary">{car.performance.drivetrain}</span>
                            <span className="text-text-muted">·</span>
                            <span className="font-mono text-xs text-text-secondary">{car.engines[0]?.power}</span>
                          </div>
                        )}

                        {/* Notes preview */}
                        {gc.notes && (
                          <p className="font-body text-sm text-text-secondary leading-relaxed line-clamp-2">
                            {gc.notes}
                          </p>
                        )}

                        {/* Mods preview */}
                        {modCount > 0 && Array.isArray(gc.mods) && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {gc.mods.slice(0, 3).map((mod) => (
                              <span
                                key={mod.id}
                                className="rounded-full bg-bg-elevated/50 border border-border px-2.5 py-0.5 font-body text-[10px] font-medium text-text-secondary"
                              >
                                {mod.name}
                              </span>
                            ))}
                            {modCount > 3 && (
                              <span className="rounded-full bg-accent-red/10 px-2.5 py-0.5 font-body text-[10px] font-bold text-accent-red">
                                +{modCount - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-bg-surface p-8 text-center">
                <p className="font-body text-sm text-text-muted">No cars in the garage yet.</p>
              </div>
            )}
          </section>

          {/* Meets RSVP section */}
          <section>
            <h2 className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-4">
              Meets ({rsvpMeets.length})
            </h2>
            {rsvpMeets.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rsvpMeets.map((meet) => (
                  <Link
                    key={meet.id}
                    to={`/meets/${meet.id}`}
                    className="group rounded-xl border border-border bg-bg-surface overflow-hidden transition-all duration-300 hover:border-accent-red/30"
                  >
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={meet.cover_image_url || fallbackImage}
                        alt={meet.name}
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {meet.meet_type && (
                        <div className="absolute top-2 left-2 rounded-full bg-accent-red/90 px-2.5 py-0.5 backdrop-blur-sm">
                          <span className="font-body text-[9px] font-bold uppercase tracking-wider text-white">
                            {meet.meet_type}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-base uppercase tracking-wide text-text-primary group-hover:text-accent-red transition-colors">
                        {meet.name}
                      </h3>
                      <p className="mt-1 font-body text-xs text-text-secondary">{meet.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-bg-surface p-8 text-center">
                <p className="font-body text-sm text-text-muted">No meets yet.</p>
              </div>
            )}
          </section>
        </div>
      </PageWrapper>
    </div>
  );
}
