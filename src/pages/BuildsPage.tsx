import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import useBuildLogs from "@/hooks/useBuildLogs";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/pitwall/PageHeader";
import PWButton from "@/components/pitwall/Button";
import Sheet, {
  PosCell,
  type SheetColumn,
} from "@/components/pitwall/Sheet";
import { useSheetSort } from "@/components/pitwall/useSheetSort";
import { CARS, money } from "@/lib/carData";
import type { BuildLog } from "@/types/buildlog";

interface BuildRow {
  log: BuildLog;
  ownerName: string;
  carName: string;
  carGen: string;
  coverImage: string | null;
  entryCount: number;
  likeCount: number;
}

const fallbackImage =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80";

type SortKey = "entries" | "cost" | "likes";
const SORT_LABELS: Record<SortKey, string> = {
  entries: "entries",
  cost: "spend",
  likes: "likes",
};

export default function BuildsPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { loading, fetchBuildLogs, toggleLike } = useBuildLogs();
  const [buildLogs, setBuildLogs] = useState<BuildLog[]>([]);
  const [rows, setRows] = useState<BuildRow[]>([]);
  const [enriching, setEnriching] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  // Optimistic like deltas per build id
  const [likeDelta, setLikeDelta] = useState<Record<string, number>>({});
  const sort = useSheetSort<SortKey>("cost");

  useEffect(() => {
    fetchBuildLogs().then(setBuildLogs);
  }, [fetchBuildLogs]);

  // The current user's likes drive the ○/● toggles
  useEffect(() => {
    if (!user || buildLogs.length === 0) return;
    let stale = false;
    supabase
      .from("build_likes")
      .select("build_log_id")
      .eq("user_id", user.id)
      .in("build_log_id", buildLogs.map((b) => b.id))
      .then(({ data }) => {
        if (!stale && data) setLiked(new Set(data.map((l) => l.build_log_id)));
      });
    return () => {
      stale = true;
    };
  }, [user, buildLogs]);

  // Enrich with owner names, car info, counts (same sources as before)
  useEffect(() => {
    if (buildLogs.length === 0) {
      setRows([]);
      setEnriching(false);
      return;
    }

    let stale = false;
    setEnriching(true);

    async function enrich() {
      const ownerIds = [...new Set(buildLogs.map((b) => b.owner_id))];
      const carIds = [...new Set(buildLogs.map((b) => b.car_id))];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", ownerIds);
      const ownerMap: Record<string, string> = {};
      (profiles ?? []).forEach((p) => {
        ownerMap[p.id] = p.display_name ?? "Anonymous";
      });

      const { data: garageCars } = await supabase
        .from("garage_cars")
        .select("id, car_id, nickname, year")
        .in("id", carIds);
      const garageMap: Record<
        string,
        { car_id: string; nickname: string | null; year: string | null }
      > = {};
      (garageCars ?? []).forEach((gc) => {
        garageMap[gc.id] = gc;
      });

      const ids = buildLogs.map((b) => b.id);

      // Cover images from the most recent entries — bounded query
      const { data: entries } = await supabase
        .from("build_entries")
        .select("build_log_id, images")
        .in("build_log_id", ids)
        .order("entry_date", { ascending: false })
        .limit(300);

      const firstImageMap: Record<string, string | null> = {};
      const entryCountFallback: Record<string, number> = {};
      (entries ?? []).forEach((e) => {
        entryCountFallback[e.build_log_id] =
          (entryCountFallback[e.build_log_id] ?? 0) + 1;
        if (!firstImageMap[e.build_log_id] && e.images?.length > 0) {
          firstImageMap[e.build_log_id] = e.images[0];
        }
      });

      // Denormalized counters preferred; bounded fallback otherwise
      const likeCountFallback: Record<string, number> = {};
      if (buildLogs.some((b) => b.like_count === undefined)) {
        const { data: likes } = await supabase
          .from("build_likes")
          .select("build_log_id")
          .in("build_log_id", ids)
          .limit(5000);
        (likes ?? []).forEach((l) => {
          likeCountFallback[l.build_log_id] =
            (likeCountFallback[l.build_log_id] ?? 0) + 1;
        });
      }

      const enriched: BuildRow[] = buildLogs.map((log) => {
        const gc = garageMap[log.car_id];
        const staticCar = gc
          ? CARS.find((c) => c.id === gc.car_id || c.slug === gc.car_id)
          : undefined;
        const carName = gc?.nickname
          ? gc.nickname
          : staticCar
            ? `${gc?.year ?? ""} ${staticCar.make} ${staticCar.model}`.trim()
            : "Unknown car";

        return {
          log,
          ownerName: ownerMap[log.owner_id] ?? "Anonymous",
          carName,
          carGen: staticCar?.generation ?? "—",
          coverImage: firstImageMap[log.id] ?? staticCar?.heroImage ?? null,
          entryCount: log.entry_count ?? entryCountFallback[log.id] ?? 0,
          likeCount: log.like_count ?? likeCountFallback[log.id] ?? 0,
        };
      });

      if (stale) return;
      setRows(enriched);
      setEnriching(false);
    }

    enrich();
    return () => {
      stale = true;
    };
  }, [buildLogs]);

  const handleLike = async (buildLogId: string) => {
    if (!user) {
      navigate("/sign-in?redirect=/builds");
      return;
    }
    const isLiked = liked.has(buildLogId);
    // Optimistic — update immediately, revert on error
    setLiked((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(buildLogId);
      else next.add(buildLogId);
      return next;
    });
    setLikeDelta((prev) => ({
      ...prev,
      [buildLogId]: (prev[buildLogId] ?? 0) + (isLiked ? -1 : 1),
    }));
    const ok = await toggleLike(buildLogId);
    if (!ok) {
      setLiked((prev) => {
        const next = new Set(prev);
        if (isLiked) next.add(buildLogId);
        else next.delete(buildLogId);
        return next;
      });
      setLikeDelta((prev) => ({
        ...prev,
        [buildLogId]: (prev[buildLogId] ?? 0) + (isLiked ? 1 : -1),
      }));
    }
  };

  const maxEntries = Math.max(1, ...rows.map((r) => r.entryCount));
  const sorted = useMemo(
    () =>
      sort.sortRows(rows, (r, key) =>
        key === "entries"
          ? r.entryCount
          : key === "cost"
            ? r.log.total_cost
            : r.likeCount + (likeDelta[r.log.id] ?? 0),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, sort.sortKey, sort.sortDir, likeDelta],
  );

  const columns: SheetColumn<BuildRow>[] = [
    { key: "no", label: "No", width: "44px", render: (_, i) => <PosCell index={i} /> },
    {
      key: "build",
      label: "Build",
      width: "1fr",
      render: (r) => (
        <span className="flex min-w-0 items-center gap-3.5 py-2 pr-6">
          <img
            src={r.coverImage || fallbackImage}
            alt=""
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImage;
            }}
            className="h-10 w-[66px] shrink-0 object-cover grayscale-[0.35]"
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold tracking-[-0.02em] text-text-primary">
              {r.log.title}
            </span>
            <span className="font-mono text-[10px] text-text-secondary">
              {r.carName} · {r.carGen}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: "owner",
      label: "Owner",
      width: "158px",
      optional: true,
      render: (r) => (
        <span className="text-[13px] text-text-secondary">{r.ownerName}</span>
      ),
    },
    {
      key: "entries",
      label: <>Entries{sort.arrow("entries")}</>,
      width: "176px",
      sortable: true,
      optional: true,
      render: (r) => (
        <span className="flex items-center gap-3 pr-7">
          <span className="relative h-[3px] flex-1 bg-bg-elevated">
            <span
              className="absolute inset-y-0 left-0 bg-accent"
              style={{ width: `${Math.round((r.entryCount / maxEntries) * 100)}%` }}
            />
          </span>
          <span className="font-mono text-xs text-text-primary">{r.entryCount}</span>
        </span>
      ),
    },
    {
      key: "cost",
      label: <>Spend{sort.arrow("cost")}</>,
      width: "116px",
      sortable: true,
      render: (r) => (
        <span className="font-mono text-[13px] text-text-primary">
          {money(r.log.total_cost)}
        </span>
      ),
    },
    {
      key: "likes",
      label: <>Likes{sort.arrow("likes")}</>,
      width: "104px",
      align: "right",
      sortable: true,
      render: (r) => {
        const isLiked = liked.has(r.log.id);
        const count = r.likeCount + (likeDelta[r.log.id] ?? 0);
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLike(r.log.id);
            }}
            aria-pressed={isLiked}
            aria-label={isLiked ? "Unlike build" : "Like build"}
            className={`flex cursor-pointer items-center gap-[7px] border px-2.5 py-1.5 font-mono text-[11px] transition-colors duration-100 ${
              isLiked
                ? "border-accent text-accent"
                : "border-border-alpha text-text-secondary hover:border-accent hover:text-accent"
            }`}
          >
            <span>{isLiked ? "●" : "○"}</span>
            <span>{count}</span>
          </button>
        );
      },
    },
  ];

  return (
    <div className="page-enter pb-14">
      <SEOHead
        title="Build Logs"
        description="Follow car builds from the RevD community. Mods, costs, progress photos — every step documented."
      />

      <PageHeader
        kicker="Showcase"
        title="BUILD LOGS"
        support="Every mod, every dollar, every step — documented. Sorted by spend, entries or likes."
        right={
          user ? (
            <Link to="/builds/create">
              <PWButton>Start a build</PWButton>
            </Link>
          ) : (
            <Link to="/sign-in?redirect=/builds/create">
              <PWButton variant="secondary">Sign in to build</PWButton>
            </Link>
          )
        }
      />

      <div className="px-6 md:px-11">
        {loading || enriching ? (
          <div className="space-y-px">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[62px] animate-pulse bg-bg-surface" />
            ))}
          </div>
        ) : sorted.length > 0 ? (
          <Sheet
            columns={columns}
            rows={sorted}
            rowKey={(r) => r.log.id}
            rowHeight={62}
            onSort={(key) => sort.toggle(key as SortKey)}
            onRowClick={(r) => navigate(`/builds/${r.log.id}`)}
          />
        ) : (
          <div className="border-t border-accent py-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              No builds on the programme
            </p>
            <p className="mt-3 max-w-[460px] text-sm leading-relaxed text-text-secondary">
              Nobody has published a build yet. Document yours — every mod,
              every dollar, every step.
            </p>
            <div className="mt-6">
              <Link to={user ? "/builds/create" : "/sign-in?redirect=/builds/create"}>
                <PWButton>Start the first build</PWButton>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Sorted-by note (parity with the filter bar count line) */}
      {sorted.length > 0 && (
        <div className="px-6 pt-3 md:px-11">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            {sorted.length} builds · sorted by {SORT_LABELS[sort.sortKey]}
          </span>
        </div>
      )}
    </div>
  );
}
