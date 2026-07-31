import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import useBuildLogs from "@/hooks/useBuildLogs";
import { supabase } from "@/lib/supabase";
import PageHeader, { StatCluster } from "@/components/pitwall/PageHeader";
import PWButton from "@/components/pitwall/Button";
import { CARS, money } from "@/lib/carData";
import type { BuildEntry, BuildLog } from "@/types/buildlog";

const fallbackImage =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80";

function entryDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return Number.isNaN(date.getTime())
    ? dateStr
    : date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

interface CarInfo {
  name: string;
  image: string | null;
  generation: string;
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

  useEffect(() => {
    if (!id) return;
    let stale = false;
    setLoading(true);
    Promise.all([fetchBuildLog(id), fetchEntries(id)])
      .then(([buildData, entriesData]) => {
        if (stale) return;
        setBuild(buildData);
        setEntries(entriesData);
      })
      .catch((err) => console.error("Failed to load build:", err))
      .finally(() => {
        if (!stale) setLoading(false);
      });
    return () => {
      stale = true;
    };
  }, [id, fetchBuildLog, fetchEntries]);

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
        const staticCar = CARS.find(
          (c) => c.id === data.car_id || c.slug === data.car_id,
        );
        const name = data.nickname
          ? data.nickname
          : staticCar
            ? `${data.year ?? ""} ${staticCar.make} ${staticCar.model}`.trim()
            : "Unknown car";
        setCarInfo({
          name,
          image: staticCar?.heroImage ?? null,
          generation: staticCar?.generation ?? "",
        });
      });
  }, [build]);

  useEffect(() => {
    if (!id) return;
    let stale = false;
    getLikeInfo(id).then((info) => {
      if (stale) return;
      setLikeCount(info.count);
      setLiked(info.liked);
    });
    return () => {
      stale = true;
    };
  }, [id, getLikeInfo]);

  async function handleLike() {
    if (!id) return;
    if (!user) {
      navigate(`/sign-in?redirect=/builds/${id}`);
      return;
    }
    if (likeLoading) return;
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

  if (loading) {
    return (
      <div className="page-enter px-6 py-[34px] md:px-11">
        <div className="h-12 w-2/3 animate-pulse bg-bg-surface" />
        <div className="mt-6 h-64 animate-pulse bg-bg-surface" />
      </div>
    );
  }

  if (!build) {
    return (
      <div className="page-enter px-6 pb-[72px] pt-[34px] md:px-11">
        <SEOHead title="Build not found" description="This build log doesn't exist." />
        <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-signal-red">
          Error
        </div>
        <h1 className="mt-2 font-mono text-[56px] font-bold leading-[0.9] tracking-[-0.045em] md:text-[96px]">
          404
        </h1>
        <p className="mt-4 max-w-[460px] text-[15px] leading-relaxed text-text-secondary">
          This build may have been removed, or the link is wrong.
        </p>
        <div className="mt-7">
          <Link
            to="/builds"
            className="border-b border-accent pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent"
          >
            Browse builds
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter pb-[72px]">
      <SEOHead
        title={build.title}
        description={build.description ?? `${build.title} — a build log on RevD.`}
      />

      <PageHeader
        breadcrumb={[{ label: "Builds" }, { label: build.title, accent: true }]}
        title={build.title.toUpperCase()}
        titleSize={44}
        right={
          <>
            <StatCluster
              size={20}
              stats={[
                { label: "Entries", value: String(entries.length) },
                {
                  label: "Spend",
                  value: money(build.total_cost),
                  color: "var(--color-accent)",
                },
              ]}
            />
            <button
              onClick={handleLike}
              disabled={likeLoading}
              aria-pressed={liked}
              aria-label={liked ? "Unlike build" : "Like build"}
              className={`flex cursor-pointer items-center gap-2 border px-4 py-[13px] font-mono text-[11px] transition-colors duration-100 ${
                liked
                  ? "border-accent text-accent"
                  : "border-border-alpha text-text-secondary hover:border-accent hover:text-accent"
              }`}
            >
              <span>{liked ? "●" : "○"}</span>
              <span>{likeCount}</span>
            </button>
          </>
        }
      />

      {/* Byline */}
      <div className="px-6 pb-5 md:px-11">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-secondary">
          {ownerName ?? "—"} · {carInfo?.name ?? "—"}
          {carInfo?.generation ? ` · ${carInfo.generation}` : ""}
        </p>
        {build.description && (
          <p className="mt-3 max-w-[620px] text-sm leading-relaxed text-text-secondary">
            {build.description}
          </p>
        )}
        {isOwner && (
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Link to={`/builds/${build.id}/add-entry`}>
              <PWButton variant="secondary">+ Add entry</PWButton>
            </Link>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted transition-colors duration-100 hover:text-signal-red"
              >
                Delete build
              </button>
            ) : (
              <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em]">
                <span className="text-text-muted">Sure?</span>
                <button
                  disabled={deleting}
                  onClick={async () => {
                    setDeleting(true);
                    const ok = await deleteBuildLog(build.id);
                    if (ok) navigate("/builds");
                    else setDeleting(false);
                  }}
                  className="cursor-pointer text-signal-red hover:opacity-80"
                >
                  {deleting ? "Deleting…" : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="cursor-pointer text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_420px]">
        {/* Entry stream — newest first */}
        <div className="min-w-0 px-6 pt-2 md:px-11">
          <div className="border-b border-accent pb-3 font-mono text-[9px] uppercase tracking-[0.24em] text-text-secondary">
            Entries · newest first
          </div>
          {entries.length === 0 ? (
            <p className="py-6 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              No entries yet
              {isOwner ? " — log the first step above" : ""}
            </p>
          ) : (
            entries.map((e, i) => (
              <div
                key={e.id}
                className="grid grid-cols-[108px_1fr] gap-x-5 border-b border-border-hair py-5 md:grid-cols-[108px_1fr_132px]"
              >
                <span className="flex flex-col gap-[3px]">
                  <span className="font-mono text-xs font-semibold text-accent">
                    Entry {String(entries.length - i).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[10px] text-text-secondary">
                    {entryDate(e.entry_date)}
                  </span>
                  {e.cost > 0 && (
                    <span className="font-mono text-[10px] text-text-muted">
                      {money(e.cost)}
                    </span>
                  )}
                </span>
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[17px] font-semibold tracking-[-0.02em] text-text-primary">
                    {e.title}
                  </span>
                  {e.body && (
                    <span className="max-w-[560px] whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                      {e.body}
                    </span>
                  )}
                  {e.images.length > 1 && (
                    <span className="mt-1 flex gap-1.5">
                      {e.images.slice(1, 4).map((url) => (
                        <img
                          key={url}
                          src={url}
                          alt=""
                          loading="lazy"
                          onError={(ev) => {
                            (ev.target as HTMLImageElement).style.display = "none";
                          }}
                          className="h-12 w-20 object-cover grayscale-[0.3]"
                        />
                      ))}
                    </span>
                  )}
                </span>
                {e.images[0] && (
                  <img
                    src={e.images[0]}
                    alt=""
                    loading="lazy"
                    onError={(ev) => {
                      (ev.target as HTMLImageElement).src = fallbackImage;
                    }}
                    className="col-start-2 mt-2 h-[78px] w-[132px] object-cover grayscale-[0.3] md:col-start-3 md:mt-0"
                  />
                )}
              </div>
            ))
          )}
        </div>

        {/* Ledger rail */}
        <div className="border-border-alpha px-6 pt-6 md:px-11 lg:border-l lg:pl-8 lg:pr-11 lg:pt-2">
          <div className="pb-2.5 font-mono text-[9px] uppercase tracking-[0.24em] text-text-secondary">
            Cost ledger
          </div>
          <div className="grid h-[26px] grid-cols-[28px_1fr_88px] items-center border-b border-border-rule font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary">
            <span>#</span>
            <span>Entry</span>
            <span className="text-right">Cost</span>
          </div>
          {entries
            .filter((e) => e.cost > 0)
            .map((e, i) => (
              <div
                key={e.id}
                className="grid min-h-10 grid-cols-[28px_1fr_88px] items-center border-b border-border-hair"
              >
                <span className="font-mono text-[10px] text-text-secondary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex min-w-0 flex-col gap-px pr-3">
                  <span className="truncate text-[13px] font-medium text-text-primary">
                    {e.title}
                  </span>
                  <span className="font-mono text-[10px] text-text-muted">
                    {entryDate(e.entry_date)}
                  </span>
                </span>
                <span className="text-right font-mono text-[13px] text-text-primary">
                  {money(e.cost)}
                </span>
              </div>
            ))}
          <div className="grid h-11 grid-cols-[28px_1fr_88px] items-center border-t border-accent">
            <span />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary">
              Total
            </span>
            <span className="text-right font-mono text-base font-semibold text-accent">
              {money(build.total_cost)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
