import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageHeader from "@/components/pitwall/PageHeader";
import PWButton from "@/components/pitwall/Button";
import { MAX_COMPARE, useCompareStore } from "@/lib/compareStore";
import { SHEET_CARS, type SheetCar } from "@/lib/carData";

interface CmpSpec {
  label: string;
  get: (c: SheetCar) => string;
  /** Numeric ranking direction — "max" highlights highest, "min" lowest. */
  dir?: "max" | "min";
  num?: (c: SheetCar) => number;
}

const CMP_SPECS: CmpSpec[] = [
  { label: "Generation", get: (c) => c.gen },
  { label: "Years", get: (c) => c.years },
  { label: "Engine", get: (c) => c.engine },
  { label: "Power", get: (c) => c.power, dir: "max", num: (c) => c.pw },
  { label: "0–100", get: (c) => c.zero, dir: "min", num: (c) => c.zeroN },
  { label: "Mass", get: (c) => `${c.weight}kg`, dir: "min", num: (c) => c.weight },
  {
    label: "Power / tonne",
    get: (c) => `${Math.round((c.pw / c.weight) * 1000)}hp`,
    dir: "max",
    num: (c) => c.pw / c.weight,
  },
  { label: "Drivetrain", get: (c) => c.dt },
  { label: "Reliability", get: (c) => `${c.rel}/100`, dir: "max", num: (c) => c.rel },
  { label: "Popularity", get: (c) => `${c.pop}/100`, dir: "max", num: (c) => c.pop },
];

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const { ids, toggle, remove } = useCompareStore();

  // Seed the tray from a shared ?cars=slug,slug link (old format kept working;
  // per-car ":trimId" suffixes are tolerated and ignored).
  useEffect(() => {
    if (ids.length > 0) return;
    const raw = searchParams.get("cars");
    if (!raw) return;
    raw
      .split(",")
      .map((part) => part.trim().split(":")[0])
      .map((slug) => SHEET_CARS.find((c) => c.slug === slug || c.id === slug))
      .filter((c): c is SheetCar => !!c)
      .slice(0, MAX_COMPARE)
      .forEach((c) => toggle(c.id));
    // Seed once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cars = useMemo(
    () =>
      ids
        .map((id) => SHEET_CARS.find((c) => c.id === id))
        .filter((c): c is SheetCar => !!c),
    [ids],
  );

  const template = `168px repeat(${Math.max(cars.length, 1)}, 1fr)`;

  return (
    <div className="page-enter pb-[72px]">
      <SEOHead
        title="Compare"
        description="Compare up to four cars head to head — specs as rows, the best figure in each row highlighted."
        canonicalUrl="https://revhub.com/compare"
      />

      <PageHeader
        kicker="Head to head"
        title="COMPARE"
        support="Specs are rows, cars are columns. The best figure in each row is highlighted."
        right={
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            {cars.length} of {MAX_COMPARE} selected
          </span>
        }
      />

      <div className="overflow-x-auto px-6 md:px-11">
        {cars.length === 0 ? (
          <div className="border-t border-accent py-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              Nothing in the tray
            </p>
            <p className="mt-3 max-w-[460px] text-sm leading-relaxed text-text-secondary">
              Check up to four rows on the cars sheet to fill the tray, then
              come back for the head-to-head.
            </p>
            <div className="mt-6">
              <Link to="/cars">
                <PWButton variant="secondary">+ Add a car</PWButton>
              </Link>
            </div>
          </div>
        ) : (
          <div className="min-w-[560px]">
            {/* Column heads — thumbnail, name, generation */}
            <div
              className="grid items-end border-b border-accent pb-3"
              style={{ gridTemplateColumns: template }}
            >
              <span className="sticky left-0 font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary">
                Spec
              </span>
              {cars.map((c) => (
                <span key={c.id} className="flex flex-col gap-2 pr-7">
                  <img
                    src={c.hero}
                    alt=""
                    loading="lazy"
                    className="h-[52px] w-[88px] object-cover grayscale-[0.35]"
                  />
                  <span className="text-sm font-semibold tracking-[-0.015em] text-text-primary">
                    {c.name}
                  </span>
                  <span className="flex items-center gap-2.5">
                    <span className="font-mono text-[11px] font-semibold text-accent">
                      {c.gen} · {c.years}
                    </span>
                    <button
                      onClick={() => remove(c.id)}
                      aria-label={`Remove ${c.name}`}
                      className="cursor-pointer font-mono text-[11px] text-text-muted transition-colors duration-100 hover:text-signal-red"
                    >
                      ×
                    </button>
                  </span>
                </span>
              ))}
            </div>

            {/* Spec rows — winning cell in accent, the rest dimmed */}
            {CMP_SPECS.map((spec) => {
              let best: number | null = null;
              if (spec.dir && spec.num && cars.length > 1) {
                const nums = cars.map((c) => spec.num!(c));
                const target =
                  spec.dir === "max" ? Math.max(...nums) : Math.min(...nums);
                best = nums.indexOf(target);
              }
              return (
                <div
                  key={spec.label}
                  className="grid h-11 items-center border-b border-border-hair transition-colors duration-100 hover:bg-bg-elevated"
                  style={{ gridTemplateColumns: template }}
                >
                  <span className="sticky left-0 font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary">
                    {spec.label}
                  </span>
                  {cars.map((c, i) => (
                    <span
                      key={c.id}
                      className={`font-mono text-sm ${
                        best === null
                          ? "text-text-primary"
                          : i === best
                            ? "font-semibold text-accent"
                            : "text-text-secondary"
                      }`}
                    >
                      {spec.get(c)}
                    </span>
                  ))}
                </div>
              );
            })}

            <div className="flex items-center gap-4 pt-[22px]">
              {cars.length < MAX_COMPARE && (
                <Link to="/cars">
                  <PWButton variant="secondary">+ Add a car</PWButton>
                </Link>
              )}
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                Pick rows on /cars to fill the tray
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
