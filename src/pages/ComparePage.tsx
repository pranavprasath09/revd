import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import Button from "@/components/ui/Button";
import PageWrapper from "@/components/layout/PageWrapper";
import carsData from "@/data/cars.json";
import type { Car } from "@/types/car";

const cars = carsData as Car[];

/* ── Helpers ──────────────────────────────────────────────── */

function parseNumeric(value: string | number): number {
  if (typeof value === "number") return value;
  return parseFloat(value.replace(/[^\d.]/g, "")) || 0;
}

function carLabel(car: Car): string {
  return `${car.make} ${car.model} ${car.generation}`;
}

type WinDirection = "higher" | "lower";

interface SpecRow {
  label: string;
  key: string;
  getValue: (car: Car) => string;
  getNumeric: (car: Car) => number;
  winDirection: WinDirection;
  unit?: string;
}

const ENGINE_SPECS: SpecRow[] = [
  {
    label: "Engine Code",
    key: "engine-code",
    getValue: (c) => c.engines[0]?.code ?? "—",
    getNumeric: () => 0,
    winDirection: "higher",
  },
  {
    label: "Displacement",
    key: "displacement",
    getValue: (c) => c.engines[0]?.displacement ?? "—",
    getNumeric: (c) => parseNumeric(c.engines[0]?.displacement ?? "0"),
    winDirection: "higher",
  },
  {
    label: "Configuration",
    key: "configuration",
    getValue: (c) => c.engines[0]?.configuration ?? "—",
    getNumeric: () => 0,
    winDirection: "higher",
  },
  {
    label: "Power",
    key: "power",
    getValue: (c) => c.engines[0]?.power ?? "—",
    getNumeric: (c) => parseNumeric(c.engines[0]?.power ?? "0"),
    winDirection: "higher",
  },
  {
    label: "Torque",
    key: "torque",
    getValue: (c) => c.engines[0]?.torque ?? "—",
    getNumeric: (c) => parseNumeric(c.engines[0]?.torque ?? "0"),
    winDirection: "higher",
  },
];

const PERFORMANCE_SPECS: SpecRow[] = [
  {
    label: "0–100 km/h",
    key: "0-100",
    getValue: (c) => c.performance["0_to_100_kph"],
    getNumeric: (c) => parseNumeric(c.performance["0_to_100_kph"]),
    winDirection: "lower",
  },
  {
    label: "Top Speed",
    key: "top-speed",
    getValue: (c) => `${c.performance.top_speed_kph} km/h`,
    getNumeric: (c) => c.performance.top_speed_kph,
    winDirection: "higher",
  },
  {
    label: "Weight",
    key: "weight",
    getValue: (c) => `${c.performance.weight_kg} kg`,
    getNumeric: (c) => c.performance.weight_kg,
    winDirection: "lower",
  },
  {
    label: "Drivetrain",
    key: "drivetrain",
    getValue: (c) => c.performance.drivetrain,
    getNumeric: () => 0,
    winDirection: "higher",
  },
];

const DIMENSION_SPECS: SpecRow[] = [
  {
    label: "Length",
    key: "length",
    getValue: (c) => `${c.dimensions.length_mm} mm`,
    getNumeric: (c) => c.dimensions.length_mm,
    winDirection: "higher",
  },
  {
    label: "Width",
    key: "width",
    getValue: (c) => `${c.dimensions.width_mm} mm`,
    getNumeric: (c) => c.dimensions.width_mm,
    winDirection: "higher",
  },
  {
    label: "Height",
    key: "height",
    getValue: (c) => `${c.dimensions.height_mm} mm`,
    getNumeric: (c) => c.dimensions.height_mm,
    winDirection: "lower",
  },
  {
    label: "Wheelbase",
    key: "wheelbase",
    getValue: (c) => `${c.dimensions.wheelbase_mm} mm`,
    getNumeric: (c) => c.dimensions.wheelbase_mm,
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
      <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-text-muted">
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
        className="w-full rounded-xl border border-border bg-bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent-red"
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
  carA,
  carB,
}: {
  title: string;
  specs: SpecRow[];
  carA: Car;
  carB: Car;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="border-b border-border bg-bg-elevated px-5 py-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">
          {title}
        </h3>
      </div>
      <div className="divide-y divide-border">
        {specs.map((spec, i) => {
          const valA = spec.getValue(carA);
          const valB = spec.getValue(carB);
          const numA = spec.getNumeric(carA);
          const numB = spec.getNumeric(carB);

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
              <span className="text-sm font-medium text-text-secondary">
                {spec.label}
              </span>
              {/* Car A */}
              <span
                className={`text-center text-sm font-semibold ${
                  aWins ? "text-green-400" : "text-text-primary"
                }`}
              >
                {valA}
                {aWins && <WinnerBadge />}
              </span>
              {/* Car B */}
              <span
                className={`text-center text-sm font-semibold ${
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
  carA,
  carB,
}: {
  title: string;
  specs: SpecRow[];
  carA: Car;
  carB: Car;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="border-b border-border bg-bg-elevated px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">
          {title}
        </h3>
      </div>
      <div className="divide-y divide-border">
        {specs.map((spec, i) => {
          const valA = spec.getValue(carA);
          const valB = spec.getValue(carB);
          const numA = spec.getNumeric(carA);
          const numB = spec.getNumeric(carB);

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
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                {spec.label}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                    {carA.make} {carA.model}
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      aWins ? "text-green-400" : "text-text-primary"
                    }`}
                  >
                    {valA}
                    {aWins && <WinnerBadge />}
                  </span>
                </div>
                <div>
                  <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                    {carB.make} {carB.model}
                  </div>
                  <span
                    className={`text-sm font-semibold ${
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

/* ── Main Page ────────────────────────────────────────────── */

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [toastVisible, setToastVisible] = useState(false);

  const slugs = useMemo(() => {
    const raw = searchParams.get("cars") ?? "";
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 2);
  }, [searchParams]);

  const selectedCars = useMemo(() => {
    return slugs
      .map((slug) => cars.find((c) => c.slug === slug))
      .filter((c): c is Car => c !== undefined);
  }, [slugs]);

  const updateSlugs = useCallback(
    (newSlugs: string[]) => {
      if (newSlugs.length === 0) {
        setSearchParams({});
      } else {
        setSearchParams({ cars: newSlugs.join(",") });
      }
    },
    [setSearchParams]
  );

  const handleAddCar = useCallback(
    (car: Car) => {
      const newSlugs = [...slugs, car.slug].slice(0, 2);
      updateSlugs(newSlugs);
    },
    [slugs, updateSlugs]
  );

  const handleRemoveCar = useCallback(
    (index: number) => {
      const newSlugs = slugs.filter((_, i) => i !== index);
      updateSlugs(newSlugs);
    },
    [slugs, updateSlugs]
  );

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    });
  }, []);

  const seoTitle =
    selectedCars.length === 2
      ? `${carLabel(selectedCars[0])} vs ${carLabel(selectedCars[1])}`
      : "Compare Cars";

  const seoDescription =
    selectedCars.length === 2
      ? `Side-by-side specs comparison: ${carLabel(selectedCars[0])} vs ${carLabel(selectedCars[1])}. Power, performance, dimensions and more.`
      : "Compare specs side by side for any enthusiast cars on RevHub.";

  const hasTwoCars = selectedCars.length === 2;

  return (
    <div className="page-enter">
      <SEOHead title={seoTitle} description={seoDescription} />

      <PageWrapper>
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent-red">
              Comparison
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
              {hasTwoCars
                ? `${selectedCars[0].make} ${selectedCars[0].model} vs ${selectedCars[1].make} ${selectedCars[1].model}`
                : "Compare Cars"}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {hasTwoCars
                ? "Side-by-side specs breakdown"
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
            const car = selectedCars[slotIndex];
            if (car) {
              return (
                <div
                  key={car.slug}
                  className="flex items-center justify-between rounded-xl border border-border bg-bg-surface px-5 py-4"
                >
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
              );
            }
            return (
              <CarSelector
                key={`selector-${slotIndex}`}
                slotIndex={slotIndex}
                excludeSlugs={slugs}
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
              {selectedCars.length === 0
                ? "No cars selected"
                : "Add one more car"}
            </p>
            <p className="text-sm text-text-secondary">
              {selectedCars.length === 0
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
                  {selectedCars[0].make} {selectedCars[0].model}
                </span>
                <span className="text-center text-xs font-bold uppercase tracking-widest text-text-muted">
                  {selectedCars[1].make} {selectedCars[1].model}
                </span>
              </div>

              <CompareSection
                title="Engine"
                specs={ENGINE_SPECS}
                carA={selectedCars[0]}
                carB={selectedCars[1]}
              />
              <CompareSection
                title="Performance"
                specs={PERFORMANCE_SPECS}
                carA={selectedCars[0]}
                carB={selectedCars[1]}
              />
              <CompareSection
                title="Dimensions"
                specs={DIMENSION_SPECS}
                carA={selectedCars[0]}
                carB={selectedCars[1]}
              />
            </div>

            {/* Mobile */}
            <div className="flex flex-col gap-6 md:hidden">
              <MobileCompareSection
                title="Engine"
                specs={ENGINE_SPECS}
                carA={selectedCars[0]}
                carB={selectedCars[1]}
              />
              <MobileCompareSection
                title="Performance"
                specs={PERFORMANCE_SPECS}
                carA={selectedCars[0]}
                carB={selectedCars[1]}
              />
              <MobileCompareSection
                title="Dimensions"
                specs={DIMENSION_SPECS}
                carA={selectedCars[0]}
                carB={selectedCars[1]}
              />
            </div>
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
