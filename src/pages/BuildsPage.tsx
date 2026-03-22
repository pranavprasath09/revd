import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";
import useBuildLogs from "@/hooks/useBuildLogs";
import { supabase } from "@/lib/supabase";
import type { BuildLog } from "@/types/buildlog";
import carsData from "@/data/cars.json";
import type { Car } from "@/types/car";

const cars = carsData as Car[];

interface BuildCardData {
  log: BuildLog;
  ownerName: string;
  carName: string;
  coverImage: string | null;
  entryCount: number;
  likeCount: number;
}

const fallbackImage =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80";

function formatCost(cost: number): string {
  if (cost === 0) return "$0";
  return `$${cost.toLocaleString()}`;
}

function BuildCard({ data }: { data: BuildCardData }) {
  return (
    <Link
      to={`/builds/${data.log.id}`}
      className="group rounded-xl border border-white/10 bg-bg-surface overflow-hidden transition-all duration-300 hover:border-accent-red/30 hover:shadow-lg hover:shadow-accent-red/5"
    >
      {/* Cover image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={data.coverImage || fallbackImage}
          alt={data.log.title}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-bg-surface/20 to-transparent" />

        {/* Cost badge */}
        {data.log.total_cost > 0 && (
          <div className="absolute top-3 right-3 rounded-lg bg-bg-base/90 px-3 py-1.5 backdrop-blur-sm">
            <span className="font-mono text-sm font-bold text-accent-red">
              {formatCost(data.log.total_cost)}
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="font-display text-xl uppercase tracking-wide text-text-primary leading-tight group-hover:text-accent-red transition-colors">
          {data.log.title}
        </h3>

        <p className="mt-1.5 font-body text-xs text-text-secondary">
          by{" "}
          <span className="text-text-primary font-medium">{data.ownerName}</span>
          {" · "}
          <span className="text-text-muted">{data.carName}</span>
        </p>

        {/* Stats row */}
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <svg
              className="h-3.5 w-3.5 text-accent-red"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            <span className="font-mono text-xs font-bold text-text-primary">
              {data.entryCount}
            </span>
            <span className="font-body text-xs text-text-muted">
              {data.entryCount === 1 ? "entry" : "entries"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg
              className="h-3.5 w-3.5 text-accent-red"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <span className="font-mono text-xs font-bold text-text-primary">
              {data.likeCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BuildsPage() {
  const { user } = useAuthContext();
  const { loading, fetchBuildLogs } = useBuildLogs();
  const [buildLogs, setBuildLogs] = useState<BuildLog[]>([]);
  const [cardData, setCardData] = useState<BuildCardData[]>([]);

  useEffect(() => {
    fetchBuildLogs().then(setBuildLogs);
  }, [fetchBuildLogs]);

  // Enrich build logs with owner names, car info, counts
  useEffect(() => {
    if (buildLogs.length === 0) {
      setCardData([]);
      return;
    }

    async function enrich() {
      const ownerIds = [...new Set(buildLogs.map((b) => b.owner_id))];
      const carIds = [...new Set(buildLogs.map((b) => b.car_id))];

      // Fetch owner names
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", ownerIds);
      const ownerMap: Record<string, string> = {};
      (profiles ?? []).forEach((p) => {
        ownerMap[p.id] = p.display_name ?? "Anonymous";
      });

      // Fetch garage car info for car names
      const { data: garageCars } = await supabase
        .from("garage_cars")
        .select("id, car_id, nickname, year")
        .in("id", carIds);
      const garageMap: Record<string, { car_id: string; nickname: string | null; year: string | null }> = {};
      (garageCars ?? []).forEach((gc) => {
        garageMap[gc.id] = gc;
      });

      // Fetch entry counts and first images
      const { data: entries } = await supabase
        .from("build_entries")
        .select("build_log_id, images")
        .in("build_log_id", buildLogs.map((b) => b.id))
        .order("entry_date", { ascending: false });

      const entryCountMap: Record<string, number> = {};
      const firstImageMap: Record<string, string | null> = {};
      (entries ?? []).forEach((e) => {
        entryCountMap[e.build_log_id] = (entryCountMap[e.build_log_id] ?? 0) + 1;
        if (!firstImageMap[e.build_log_id] && e.images?.length > 0) {
          firstImageMap[e.build_log_id] = e.images[0];
        }
      });

      // Fetch like counts
      const { data: likes } = await supabase
        .from("build_likes")
        .select("build_log_id")
        .in("build_log_id", buildLogs.map((b) => b.id));
      const likeCountMap: Record<string, number> = {};
      (likes ?? []).forEach((l) => {
        likeCountMap[l.build_log_id] = (likeCountMap[l.build_log_id] ?? 0) + 1;
      });

      const enriched: BuildCardData[] = buildLogs.map((log) => {
        const gc = garageMap[log.car_id];
        const staticCar = gc
          ? cars.find((c) => c.id === gc.car_id || c.slug === gc.car_id)
          : undefined;
        const carName = gc?.nickname
          ? gc.nickname
          : staticCar
            ? `${gc?.year ?? ""} ${staticCar.make} ${staticCar.model}`.trim()
            : "Unknown Car";
        const coverImage =
          firstImageMap[log.id] ?? staticCar?.heroImage ?? null;

        return {
          log,
          ownerName: ownerMap[log.owner_id] ?? "Anonymous",
          carName,
          coverImage,
          entryCount: entryCountMap[log.id] ?? 0,
          likeCount: likeCountMap[log.id] ?? 0,
        };
      });

      setCardData(enriched);
    }

    enrich();
  }, [buildLogs]);

  return (
    <div className="page-enter">
      <SEOHead
        title="Build Logs"
        description="Follow car builds from the RevD community. Mods, costs, progress photos — every step documented."
      />

      {/* Header */}
      <div className="border-b border-border bg-bg-surface/50">
        <PageWrapper>
          <div className="py-10 sm:py-14">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-body text-[11px] font-bold uppercase tracking-widest text-accent-red mb-3">
                  Showcase
                </p>
                <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-text-primary leading-none">
                  Build Logs
                </h1>
                <p className="font-body mt-3 max-w-2xl text-base text-text-secondary leading-relaxed">
                  Follow builds from the community. Every mod, every dollar, every step — documented.
                </p>
              </div>

              {user && (
                <Link
                  to="/builds/create"
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
                  Start a Build
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-[16/10] animate-pulse rounded-xl bg-bg-surface"
                />
              ))}
            </div>
          ) : cardData.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cardData.map((d) => (
                <BuildCard key={d.log.id} data={d} />
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
                    d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                  />
                </svg>
              </div>
              <h2 className="font-display text-2xl uppercase tracking-wide text-text-primary mb-2">
                No Builds Yet
              </h2>
              <p className="font-body text-sm text-text-secondary max-w-md mb-6">
                Be the first to document your build. Add a car to your garage, then start logging every mod.
              </p>
              {user ? (
                <Link
                  to="/builds/create"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
                >
                  Start the First Build
                </Link>
              ) : (
                <Link
                  to="/sign-in?redirect=/builds"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
                >
                  Sign In to Start Building
                </Link>
              )}
              <div className="mt-6 flex items-center gap-4">
                <Link to="/photos" className="font-body text-sm text-text-secondary hover:text-accent-red transition-colors">
                  Browse Photos
                </Link>
                <span className="text-text-muted">·</span>
                <Link to="/meets" className="font-body text-sm text-text-secondary hover:text-accent-red transition-colors">
                  Find Meets
                </Link>
                <span className="text-text-muted">·</span>
                <Link to="/garage" className="font-body text-sm text-text-secondary hover:text-accent-red transition-colors">
                  My Garage
                </Link>
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}
