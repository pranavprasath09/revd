import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import Button from "@/components/ui/Button";
import PageWrapper from "@/components/layout/PageWrapper";
import carsData from "@/data/cars.json";
import type { Car, CarTrim } from "@/types/car";

const cars = carsData as Car[];

/* ── Helpers ──────────────────────────────────────────────── */

function parseNumeric(value: string | number): number {
  if (typeof value === "number") return value;
  return parseFloat(value.replace(/[^\d.]/g, "")) || 0;
}

function carLabel(car: Car): string {
  return `${car.make} ${car.model} ${car.generation}`;
}

/** A car plus an optionally selected trim. No trim = generation overview. */
interface CompareSubject {
  car: Car;
  trim?: CarTrim;
}

function subjectLabel(s: CompareSubject): string {
  return s.trim
    ? `${s.car.make} ${s.car.model} ${s.trim.name}`
    : carLabel(s.car);
}

type WinDirection = "higher" | "lower";

interface SpecRow {
  label: string;
  key: string;
  getValue: (s: CompareSubject) => string;
  getNumeric: (s: CompareSubject) => number;
  winDirection: WinDirection;
}

const ENGINE_SPECS: SpecRow[] = [
  {
    label: "Engine",
    key: "engine",
    getValue: (s) =>
      s.trim
        ? s.trim.engine
        : `${s.car.engines[0]?.displacement ?? ""} ${s.car.engines[0]?.configuration ?? ""} (${s.car.engines[0]?.code ?? "—"})`,
    getNumeric: () => 0,
    winDirection: "higher",
  },
  {
    label: "Power",
    key: "power",
    getValue: (s) => (s.trim ? s.trim.power : s.car.engines[0]?.power ?? "—"),
    getNumeric: (s) =>
      parseNumeric(s.trim ? s.trim.power : s.car.engines[0]?.power ?? "0"),
    winDirection: "higher",
  },
  {
    label: "Torque",
    key: "torque",
    getValue: (s) => (s.trim ? s.trim.torque : s.car.engines[0]?.torque ?? "—"),
    getNumeric: (s) =>
      parseNumeric(s.trim ? s.trim.torque : s.car.engines[0]?.torque ?? "0"),
    winDirection: "higher",
  },
  {
    label: "Transmission",
    key: "transmission",
    getValue: (s) => s.trim?.transmission ?? "—",
    getNumeric: () => 0,
    winDirection: "higher",
  },
];

const PERFORMANCE_SPECS: SpecRow[] = [
  {
    label: "0–100 km/h",
    key: "0-100",
    getValue: (s) =>
      s.trim ? s.trim.zeroTo100 : s.car.performance["0_to_100_kph"],
    getNumeric: (s) =>
      parseNumeric(s.trim ? s.trim.zeroTo100 : s.car.performance["0_to_100_kph"]),
    winDirection: "lower",
  },
  {
    label: "Top Speed",
    key: "top-speed",
    getValue: (s) =>
      `${s.trim ? s.trim.topSpeedKph : s.car.performance.top_speed_kph} km/h`,
    getNumeric: (s) =>
      s.trim ? s.trim.topSpeedKph : s.car.performance.top_speed_kph,
    winDirection: "higher",
  },
  {
    label: "Weight",
    key: "weight",
    getValue: (s) =>
      `${s.trim ? s.trim.weightKg : s.car.performance.weight_kg} kg`,
    getNumeric: (s) => (s.trim ? s.trim.weightKg : s.car.performance.weight_kg),
    winDirection: "lower",
  },
  {
    label: "Power-to-weight",
    key: "power-to-weight",
    getValue: (s) => {
      const power = parseNumeric(
        s.trim ? s.trim.power : s.car.engines[0]?.power ?? "0"
      );
      const weight = s.trim ? s.trim.weightKg : s.car.performance.weight_kg;
      if (!power || !weight) return "—";
      return `${Math.round(power / (weight / 1000))} hp/ton`;
    },
    getNumeric: (s) => {
      const power = parseNumeric(
        s.trim ? s.trim.power : s.car.engines[0]?.power ?? "0"
      );
      const weight = s.trim ? s.trim.weightKg : s.car.performance.weight_kg;
      if (!power || !weight) return 0;
      return Math.round(power / (weight / 1000));
    },
    winDirection: "higher",
  },
  {
    label: "Drivetrain",
    key: "drivetrain",
    getValue: (s) => (s.trim ? s.trim.drivetrain : s.car.performance.drivetrain),
    getNumeric: () => 0,
    winDirection: "higher",
  },
];

const DIMENSION_SPECS: SpecRow[] = [
  {
    label: "Length",
    key: "length",
    getValue: (s) => `${s.car.dimensions.length_mm} mm`,
    getNumeric: (s) => s.car.dimensions.length_mm,
    winDirection: "higher",
  },
  {
    label: "Width",
    key: "width",
    getValue: (s) => `${s.car.dimensions.width_mm} mm`,
    getNumeric: (s) => s.car.dimensions.width_mm,
    winDirection: "higher",
  },
  {
    label: "Height",
    key: "height",
    getValue: (s) => `${s.car.dimensions.height_mm} mm`,
    getNumeric: (s) => s.car.dimensions.height_mm,
    winDirection: "lower",
  },
  {
    label: "Wheelbase",
    key: "wheelbase",
    getValue: (s) => `${s.car.dimensions.wheelbase_mm} mm`,
    getNumeric: (s) => s.car.dimensions.wheelbase_mm,
    winDirection: "higher",
  },
];

/* ── Car Selector ─────────────────────────────────────────── */

function CarSelector({
  onSelect,
  excludeSlugs,
  slotIndex,
}: {
  onSelect: (car: Car) => void;
  excludeSlugs: string[];
  slotIndex: number;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return cars
      .filter(
        (c) =>
          !excludeSlugs.includes(c.slug) &&
          `${c.make} ${c.model} ${c.generation}`.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, excludeSlugs]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="font-body mb-2 block text-xs font-semibold uppercase tracking-widest text-text-muted">
        Car {slotIndex + 1}
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (query.trim()) setIsOpen(true);
        }}
        placeholder="Search make, model, or generation..."
        className="font-body w-full rounded-xl border border-border bg-bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent-red"
      />
      {isOpen && filtered.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border bg-bg-elevated shadow-xl">
          {filtered.map((car) => (
            <li key={car.slug}>
              <button
                type="button"
                onClick={() => {
                  onSelect(car);
                  setQuery("");
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-text-primary transition-colors hover:bg-bg-surface"
              >
                <span className="font-semibold">
                  {car.make} {car.model}
                </span>
                <span className="text-text-muted">{car.generation}</span>
                <span className="ml-auto text-xs text-text-muted">
                  {car.years}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {isOpen && query.trim() && filtered.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-muted shadow-xl">
          No cars found
        </div>
      )}
    </div>
  );
}

/* ── Winner Badge ─────────────────────────────────────────── */

function WinnerBadge() {
  return (
    <span className="ml-2 inline-flex items-center rounded-md bg-accent-red/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-red">
      Winner
    </span>
  );
}

/* ── Compare Table Section ────────────────────────────────── */

function CompareSection({
  title,
  specs,
  a,
  b,
}: {
  title: string;
  specs: SpecRow[];
  a: CompareSubject;
  b: CompareSubject;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="border-b border-border bg-bg-elevated px-5 py-3">
        <h3 className="font-display text-sm uppercase tracking-widest text-text-muted">
          {title}
        </h3>
      </div>
      <div className="divide-y divide-border">
        {specs.map((spec, i) => {
          const valA = spec.getValue(a);
          const valB = spec.getValue(b);
          const numA = spec.getNumeric(a);
          const numB = spec.getNumeric(b);

          let aWins = false;
          let bWins = false;
          // Only highlight if both values are comparable (non-zero)
          if (numA !== 0 && numB !== 0 && numA !== numB) {
            if (spec.winDirection === "higher") {
              aWins = numA > numB;
              bWins = numB > numA;
            } else {
              aWins = numA < numB;
              bWins = numB < numA;
            }
          }

          const rowBg = i % 2 === 0 ? "bg-bg-surface" : "bg-bg-base";

          return (
            <div
              key={spec.key}
              className={`grid grid-cols-3 items-center gap-4 px-5 py-3.5 ${rowBg}`}
            >
              {/* Label */}
              <span className="font-body text-sm font-medium text-text-secondary">
                {spec.label}
              </span>
              {/* Subject A */}
              <span
                className={`font-mono text-center text-sm font-semibold ${
                  aWins ? "text-green-400" : "text-text-primary"
                }`}
              >
                {valA}
                {aWins && <WinnerBadge />}
              </span>
              {/* Subject B */}
              <span
                className={`font-mono text-center text-sm font-semibold ${
                  bWins ? "text-green-400" : "text-text-primary"
                }`}
              >
                {valB}
                {bWins && <WinnerBadge />}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Mobile Compare Card ──────────────────────────────────── */

function MobileCompareSection({
  title,
  specs,
  a,
  b,
}: {
  title: string;
  specs: SpecRow[];
  a: CompareSubject;
  b: CompareSubject;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="border-b border-border bg-bg-elevated px-4 py-3">
        <h3 className="font-display text-sm uppercase tracking-widest text-text-muted">
          {title}
        </h3>
      </div>
      <div className="divide-y divide-border">
        {specs.map((spec, i) => {
          const valA = spec.getValue(a);
          const valB = spec.getValue(b);
          const numA = spec.getNumeric(a);
          const numB = spec.getNumeric(b);

          let aWins = false;
          let bWins = false;
          if (numA !== 0 && numB !== 0 && numA !== numB) {
            if (spec.winDirection === "higher") {
              aWins = numA > numB;
              bWins = numB > numA;
            } else {
              aWins = numA < numB;
              bWins = numB < numA;
            }
          }

          const rowBg = i % 2 === 0 ? "bg-bg-surface" : "bg-bg-base";

          return (
            <div key={spec.key} className={`px-4 py-3 ${rowBg}`}>
              <div className="font-body mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                {spec.label}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="font-body mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                    {a.car.make} {a.trim?.name ?? a.car.model}
                  </div>
                  <span
                    className={`font-mono text-sm font-semibold ${
                      aWins ? "text-green-400" : "text-text-primary"
                    }`}
                  >
                    {valA}
                    {aWins && <WinnerBadge />}
                  </span>
                </div>
                <div>
                  <div className="font-body mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                    {b.car.make} {b.trim?.name ?? b.car.model}
                  </div>
                  <span
                    className={`font-mono text-sm font-semibold ${
                      bWins ? "text-green-400" : "text-text-primary"
                    }`}
                  >
                    {valB}
                    {bWins && <WinnerBadge />}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Trim Highlights ──────────────────────────────────────── */

function TrimHighlightCard({ subject }: { subject: CompareSubject }) {
  const { car, trim } = subject;
  if (!trim) {
    return (
      <div className="rounded-xl border border-dashed border-border p-5">
        <p className="font-body text-sm text-text-muted">
          Select a trim of the {car.make} {car.model} above to see what it
          offers.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5">
      <h3 className="font-display text-base uppercase tracking-wide text-text-primary">
        {car.make} {car.model} {trim.name}
      </h3>
      <p className="font-body mt-0.5 text-xs text-text-muted">
        {trim.engine} · {trim.yearsOffered}
      </p>
      <ul className="mt-4 space-y-2">
        {trim.highlights.map((h) => (
          <li
            key={h}
            className="font-body flex items-start gap-2.5 text-sm leading-relaxed text-text-secondary"
          >
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-red" />
            {h}
          </li>
        ))}
      </ul>
      {trim.funFact && (
        <div className="mt-4 rounded-lg border border-accent-red/25 bg-accent-red/5 px-3.5 py-2.5">
          <p className="font-body text-[10px] font-bold uppercase tracking-wider text-accent-red mb-1">
            Did you know
          </p>
          <p className="font-body text-sm leading-relaxed text-text-secondary">
            {trim.funFact}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────── */

interface CompareEntry {
  slug: string;
  trimId?: string;
}

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [toastVisible, setToastVisible] = useState(false);

  // URL format: ?cars=slugA:trimId,slugB  — :trimId optional per car, so old
  // plain-slug links keep working and trim choices are shareable.
  const entries = useMemo<CompareEntry[]>(() => {
    const raw = searchParams.get("cars") ?? "";
    return raw
      .split(",")
      .map((part) => {
        const [slug, trimId] = part.trim().split(":");
        return { slug, trimId: trimId || undefined };
      })
      .filter((e) => cars.some((c) => c.slug === e.slug))
      .slice(0, 2);
  }, [searchParams]);

  const subjects = useMemo<CompareSubject[]>(() => {
    return entries
      .map((entry): CompareSubject | undefined => {
        const car = cars.find((c) => c.slug === entry.slug);
        if (!car) return undefined;
        const trim = entry.trimId
          ? car.trims?.find((t) => t.id === entry.trimId)
          : undefined;
        return trim ? { car, trim } : { car };
      })
      .filter((s): s is CompareSubject => s !== undefined);
  }, [entries]);

  const updateEntries = useCallback(
    (newEntries: CompareEntry[]) => {
      if (newEntries.length === 0) {
        setSearchParams({});
      } else {
        setSearchParams({
          cars: newEntries
            .map((e) => (e.trimId ? `${e.slug}:${e.trimId}` : e.slug))
            .join(","),
        });
      }
    },
    [setSearchParams]
  );

  const handleAddCar = useCallback(
    (car: Car) => {
      updateEntries([...entries, { slug: car.slug }].slice(0, 2));
    },
    [entries, updateEntries]
  );

  const handleRemoveCar = useCallback(
    (index: number) => {
      updateEntries(entries.filter((_, i) => i !== index));
    },
    [entries, updateEntries]
  );

  const handleTrimChange = useCallback(
    (index: number, trimId: string) => {
      updateEntries(
        entries.map((e, i) =>
          i === index ? { ...e, trimId: trimId || undefined } : e
        )
      );
    },
    [entries, updateEntries]
  );

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    });
  }, []);

  const hasTwoCars = subjects.length === 2;

  const seoTitle = hasTwoCars
    ? `${subjectLabel(subjects[0])} vs ${subjectLabel(subjects[1])}`
    : "Compare Cars";

  const seoDescription = hasTwoCars
    ? `Side-by-side specs comparison: ${subjectLabel(subjects[0])} vs ${subjectLabel(subjects[1])}. Power, performance, dimensions and more.`
    : "Compare specs side by side for any enthusiast cars on RevHub.";

  return (
    <div className="page-enter">
      <SEOHead title={seoTitle} description={seoDescription} />

      <PageWrapper>
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-body mb-1 text-xs font-semibold uppercase tracking-widest text-accent-red">
              Comparison
            </p>
            <h1 className="font-display text-3xl uppercase tracking-wide text-text-primary sm:text-4xl">
              {hasTwoCars
                ? `${subjects[0].car.make} ${subjects[0].car.model} vs ${subjects[1].car.make} ${subjects[1].car.model}`
                : "Compare Cars"}
            </h1>
            <p className="font-body mt-1 text-sm text-text-secondary">
              {hasTwoCars
                ? "Side-by-side specs breakdown — pick a trim on each side for trim-level numbers"
                : "Select two cars to compare specs, performance, and dimensions."}
            </p>
          </div>
          {hasTwoCars && (
            <Button variant="secondary" size="sm" onClick={handleShare}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share
            </Button>
          )}
        </div>

        {/* Car Selectors + Selected Cards */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1].map((slotIndex) => {
            const subject = subjects[slotIndex];
            if (subject) {
              const { car, trim } = subject;
              const trims = car.trims ?? [];
              return (
                <div
                  key={car.slug}
                  className="rounded-xl border border-border bg-bg-surface px-5 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-text-muted">
                        Car {slotIndex + 1}
                      </p>
                      <p className="text-lg font-bold text-text-primary">
                        {car.make} {car.model}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {car.generation} &middot; {car.years}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCar(slotIndex)}
                      className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-elevated hover:text-accent-red"
                      aria-label={`Remove ${carLabel(car)}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  {trims.length > 0 && (
                    <div className="mt-3 border-t border-border pt-3">
                      <label className="font-body mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        Trim
                      </label>
                      <select
                        value={trim?.id ?? ""}
                        onChange={(e) =>
                          handleTrimChange(slotIndex, e.target.value)
                        }
                        className="font-body w-full cursor-pointer rounded-lg border border-border bg-bg-base px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent-red"
                      >
                        <option value="">Generation overview</option>
                        {trims.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} — {t.power}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            }
            return (
              <CarSelector
                key={`selector-${slotIndex}`}
                slotIndex={slotIndex}
                excludeSlugs={entries.map((e) => e.slug)}
                onSelect={handleAddCar}
              />
            );
          })}
        </div>

        {/* Empty State */}
        {!hasTwoCars && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mb-4 h-12 w-12 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            <p className="mb-1 text-lg font-semibold text-text-primary">
              {subjects.length === 0 ? "No cars selected" : "Add one more car"}
            </p>
            <p className="text-sm text-text-secondary">
              {subjects.length === 0
                ? "Search and select two cars above to compare specs side by side."
                : "Search for another car above to start comparing."}
            </p>
          </div>
        )}

        {/* Comparison Tables */}
        {hasTwoCars && (
          <>
            {/* Desktop */}
            <div className="hidden flex-col gap-6 md:flex">
              {/* Column Headers */}
              <div className="grid grid-cols-3 gap-4 px-5">
                <span />
                <span className="text-center text-xs font-bold uppercase tracking-widest text-text-muted">
                  {subjects[0].car.make} {subjects[0].car.model}
                  {subjects[0].trim && (
                    <span className="text-accent-red"> {subjects[0].trim.name}</span>
                  )}
                </span>
                <span className="text-center text-xs font-bold uppercase tracking-widest text-text-muted">
                  {subjects[1].car.make} {subjects[1].car.model}
                  {subjects[1].trim && (
                    <span className="text-accent-red"> {subjects[1].trim.name}</span>
                  )}
                </span>
              </div>

              <CompareSection
                title="Engine"
                specs={ENGINE_SPECS}
                a={subjects[0]}
                b={subjects[1]}
              />
              <CompareSection
                title="Performance"
                specs={PERFORMANCE_SPECS}
                a={subjects[0]}
                b={subjects[1]}
              />
              <CompareSection
                title="Dimensions"
                specs={DIMENSION_SPECS}
                a={subjects[0]}
                b={subjects[1]}
              />
            </div>

            {/* Mobile */}
            <div className="flex flex-col gap-6 md:hidden">
              <MobileCompareSection
                title="Engine"
                specs={ENGINE_SPECS}
                a={subjects[0]}
                b={subjects[1]}
              />
              <MobileCompareSection
                title="Performance"
                specs={PERFORMANCE_SPECS}
                a={subjects[0]}
                b={subjects[1]}
              />
              <MobileCompareSection
                title="Dimensions"
                specs={DIMENSION_SPECS}
                a={subjects[0]}
                b={subjects[1]}
              />
            </div>

            {/* What each trim offers */}
            {(subjects[0].trim || subjects[1].trim) && (
              <div className="mt-8">
                <h2 className="font-display mb-4 text-sm uppercase tracking-widest text-text-muted">
                  What each trim offers
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <TrimHighlightCard subject={subjects[0]} />
                  <TrimHighlightCard subject={subjects[1]} />
                </div>
              </div>
            )}
          </>
        )}
      </PageWrapper>

      {/* Toast */}
      <div
        className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-bg-elevated px-5 py-3 text-sm font-semibold text-text-primary shadow-xl border border-border transition-all duration-300 ${
          toastVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        Copied link to clipboard!
      </div>
    </div>
  );
}
