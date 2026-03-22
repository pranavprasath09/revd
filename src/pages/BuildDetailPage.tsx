import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";
import useBuildLogs from "@/hooks/useBuildLogs";
import { supabase } from "@/lib/supabase";
import type { BuildLog, BuildEntry } from "@/types/buildlog";
import carsData from "@/data/cars.json";
import type { Car } from "@/types/car";

const cars = carsData as Car[];

const fallbackImage =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80";

function formatCost(cost: number): string {
  if (cost === 0) return "$0";
  return `$${cost.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface CarInfo {
  name: string;
  image: string | null;
  generation: string;
}

function EntryCard({ entry }: { entry: BuildEntry }) {
  return (
    <div className="relative pl-8 pb-8 border-l-2 border-border last:border-l-0 last:pb-0">
      {/* Timeline dot */}
      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-accent-red bg-bg-base" />

      <div className="rounded-xl border border-white/10 bg-bg-surface overflow-hidden">
        {/* Entry images */}
        {entry.images.length > 0 && (
          <div
            className={`grid gap-1 ${
              entry.images.length === 1
                ? "grid-cols-1"
                : entry.images.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-2 sm:grid-cols-3"
            }`}
          >
            {entry.images.map((url) => (
              <div
                key={url}
                className={`overflow-hidden ${
                  entry.images.length === 1
                    ? "aspect-[16/9]"
                    : "aspect-square"
                }`}
              >
                <img
                  src={url}
                  alt={entry.title}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-xl uppercase tracking-wide text-text-primary">
              {entry.title}
            </h3>
            {entry.cost > 0 && (
              <span className="shrink-0 rounded-lg bg-accent-red/10 px-3 py-1 font-mono text-sm font-bold text-accent-red">
                {formatCost(entry.cost)}
              </span>
            )}
          </div>

          {/* Date */}
          <p className="mt-1 font-body text-xs text-text-muted">
            {formatDate(entry.entry_date)}
          </p>

          {/* Body */}
          {entry.body && (
            <p className="mt-3 font-body text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              {entry.body}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BuildDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { fetchBuildLog, fetchEntries, toggleLike, getLikeInfo, deleteBuildLog } =
    useBuildLogs();

  const [build, setBuild] = useState<BuildLog | null>(null);
  const [entries, setEntries] = useState<BuildEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [carInfo, setCarInfo] = useState<CarInfo | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch build log and entries
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchBuildLog(id), fetchEntries(id)])
      .then(([buildData, entriesData]) => {
        setBuild(buildData);
        setEntries(entriesData);
      })
      .catch((err) => console.error("Failed to load build:", err))
      .finally(() => setLoading(false));
  }, [id, fetchBuildLog, fetchEntries]);

  // Fetch owner name and car info
  useEffect(() => {
    if (!build) return;

    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", build.owner_id)
      .single()
      .then(({ data }) => {
        setOwnerName(data?.display_name ?? "Anonymous");
      });

    supabase
      .from("garage_cars")
      .select("car_id, nickname, year")
      .eq("id", build.car_id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const staticCar = cars.find(
          (c) => c.id === data.car_id || c.slug === data.car_id
        );
        const name = data.nickname
          ? data.nickname
          : staticCar
            ? `${data.year ?? ""} ${staticCar.make} ${staticCar.model}`.trim()
            : "Unknown Car";
        setCarInfo({
          name,
          image: staticCar?.heroImage ?? null,
          generation: staticCar?.generation ?? "",
        });
      });
  }, [build]);

  // Fetch likes
  const loadLikes = useCallback(async () => {
    if (!id) return;
    const info = await getLikeInfo(id);
    setLikeCount(info.count);
    setLiked(info.liked);
  }, [id, getLikeInfo]);

  useEffect(() => {
    loadLikes();
  }, [loadLikes]);

  async function handleLike() {
    if (!id || !user) return;
    setLikeLoading(true);
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => (newLiked ? c + 1 : Math.max(0, c - 1)));
    const success = await toggleLike(id);
    if (!success) {
      setLiked(!newLiked);
      setLikeCount((c) => (newLiked ? Math.max(0, c - 1) : c + 1));
    }
    setLikeLoading(false);
  }

  const isOwner = user?.id === build?.owner_id;

  // Loading
  if (loading) {
    return (
      <div className="page-enter">
        <div className="relative h-64 animate-pulse bg-bg-surface" />
        <PageWrapper>
          <div className="space-y-4 py-8">
            <div className="h-10 w-2/3 animate-pulse rounded-lg bg-bg-surface" />
            <div className="h-6 w-1/3 animate-pulse rounded-lg bg-bg-surface" />
            <div className="h-48 animate-pulse rounded-xl bg-bg-surface" />
          </div>
        </PageWrapper>
      </div>
    );
  }

  // Not found
  if (!build) {
    return (
      <div className="page-enter">
        <SEOHead title="Build Not Found" description="This build log doesn't exist." />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="font-mono text-6xl font-black text-text-muted">404</div>
          <h1 className="font-display mt-4 text-2xl uppercase tracking-wide text-text-primary">
            Build not found
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            This build may have been removed or the link is incorrect.
          </p>
          <Link
            to="/builds"
            className="mt-6 rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
          >
            Browse Builds
          </Link>
        </div>
      </div>
    );
  }

  const heroImage = entries.find((e) => e.images.length > 0)?.images[0] ?? carInfo?.image ?? fallbackImage;

  return (
    <div className="page-enter">
      <SEOHead
        title={`${build.title} — Build Log on RevD`}
        description={build.description || `${carInfo?.name ?? "Car"} build log. ${entries.length} entries. Total: ${formatCost(build.total_cost)}.`}
        ogImage={heroImage}
      />

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="relative h-64 sm:h-80 w-full">
          <img
            src={heroImage}
            alt={build.title}
            className="h-full w-full object-cover"
            loading="eager"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-base/60 via-transparent to-transparent" />

          {/* Back button */}
          <div className="absolute top-6 left-6 z-10">
            <Link
              to="/builds"
              className="inline-flex items-center gap-2 rounded-full bg-bg-base/70 px-4 py-2 backdrop-blur-md border border-white/10 font-body text-sm text-white/80 hover:text-white hover:bg-bg-base/90 transition-all"
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
              All Builds
            </Link>
          </div>

          {/* Title overlay */}
          <div className="absolute inset-x-0 bottom-0 px-6 pb-8 sm:px-10 sm:pb-12">
            <div className="mx-auto max-w-7xl">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wide text-white leading-none">
                {build.title}
              </h1>
              <p className="mt-2 font-body text-base text-white/70">
                {carInfo?.name ?? "..."}{" "}
                <span className="text-white/40">·</span>{" "}
                by <span className="text-white font-semibold">{ownerName ?? "..."}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <PageWrapper>
        <div className="-mt-4 relative z-10 mb-8 rounded-xl border border-white/10 bg-bg-surface/80 px-5 py-4 shadow-2xl shadow-black/40 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-6">
            {/* Total cost */}
            <div>
              <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Total Cost
              </p>
              <p className="font-mono text-lg font-bold text-accent-red">
                {formatCost(build.total_cost)}
              </p>
            </div>

            {/* Entries */}
            <div>
              <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Entries
              </p>
              <p className="font-mono text-lg font-bold text-text-primary">
                {entries.length}
              </p>
            </div>

            {/* Started */}
            <div>
              <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Started
              </p>
              <p className="font-body text-sm font-semibold text-text-primary">
                {timeAgo(build.created_at)}
              </p>
            </div>

            {/* Spacer + Like button */}
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={handleLike}
                disabled={likeLoading || !user}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-body text-sm font-bold transition-all cursor-pointer disabled:cursor-not-allowed ${
                  liked
                    ? "bg-accent-red/10 border border-accent-red/30 text-accent-red"
                    : "border border-white/10 text-text-secondary hover:border-accent-red/30 hover:text-accent-red"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill={liked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                {likeCount}
              </button>
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* Description */}
      {build.description && (
        <PageWrapper>
          <div className="mb-8 rounded-xl border border-border bg-bg-surface p-6">
            <h2 className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">
              About This Build
            </h2>
            <p className="font-body text-base text-text-secondary leading-relaxed whitespace-pre-line">
              {build.description}
            </p>
          </div>
        </PageWrapper>
      )}

      {/* Timeline of entries */}
      <PageWrapper>
        <div className="pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Build Timeline ({entries.length})
            </h2>
            {isOwner && (
              <Link
                to={`/builds/${id}/add-entry`}
                className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-4 py-2.5 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </svg>
                Add Entry
              </Link>
            )}
          </div>

          {entries.length > 0 ? (
            <div className="ml-2">
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-bg-surface p-12 text-center">
              <p className="font-body text-sm text-text-muted mb-4">
                No entries yet.{" "}
                {isOwner && "Start documenting your build!"}
              </p>
              {isOwner && (
                <Link
                  to={`/builds/${id}/add-entry`}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-5 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
                >
                  Add First Entry
                </Link>
              )}
            </div>
          )}

          {/* Owner actions */}
          {isOwner && (
            <div className="mt-8 rounded-xl border border-accent-red/20 bg-accent-red/5 p-4">
              <p className="font-body text-xs font-bold uppercase tracking-wider text-accent-red mb-1">
                Your Build
              </p>
              <p className="font-body text-sm text-text-secondary mb-3">
                Share the link to show off your progress.
              </p>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 font-body text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Build
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="font-body text-xs text-red-400">Delete permanently?</span>
                  <button
                    onClick={async () => {
                      setDeleting(true);
                      const ok = await deleteBuildLog(build.id);
                      if (ok) {
                        navigate("/builds");
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
  );
}
