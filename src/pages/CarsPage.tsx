import { useState, useMemo } from "react";
import CarCard from "@/components/cars/CarCard";
import CategoryFilter from "@/components/ui/CategoryFilter";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import carsData from "@/data/cars.json";
import type { Car } from "@/types/car";

const cars = carsData as Car[];

// Derive unique filter values from the dataset
const ALL = "All";

const makes = [ALL, ...Array.from(new Set(cars.map((c) => c.make))).sort()];

const bodyStyles = [
  ALL,
  ...Array.from(new Set(cars.flatMap((c) => c.bodyStyles))).sort(),
];

const drivetrains = [
  ALL,
  ...Array.from(new Set(cars.map((c) => c.performance.drivetrain))).sort(),
];

export default function CarsPage() {
  const [search, setSearch] = useState("");
  const [activeMake, setActiveMake] = useState(ALL);
  const [activeBody, setActiveBody] = useState(ALL);
  const [activeDrivetrain, setActiveDrivetrain] = useState(ALL);

  const hasActiveFilters =
    search !== "" ||
    activeMake !== ALL ||
    activeBody !== ALL ||
    activeDrivetrain !== ALL;

  const filteredCars = useMemo(() => {
    const query = search.toLowerCase().trim();

    return cars.filter((car) => {
      // Search filter — match against make, model, generation
      if (query) {
        const haystack =
          `${car.make} ${car.model} ${car.generation} ${car.years}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      // Make filter
      if (activeMake !== ALL && car.make !== activeMake) return false;

      // Body style filter — car has at least one matching body style
      if (activeBody !== ALL && !car.bodyStyles.includes(activeBody))
        return false;

      // Drivetrain filter
      if (
        activeDrivetrain !== ALL &&
        car.performance.drivetrain !== activeDrivetrain
      )
        return false;

      return true;
    });
  }, [search, activeMake, activeBody, activeDrivetrain]);

  function clearFilters() {
    setSearch("");
    setActiveMake(ALL);
    setActiveBody(ALL);
    setActiveDrivetrain(ALL);
  }

  return (
    <>
      <SEOHead
        title="Browse Cars"
        description="Browse specs, mods, and reliability data for every enthusiast car. Filter by make, body style, and drivetrain."
        canonicalUrl="https://revhub.com/cars"
      />

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 border-b border-border bg-bg-base/95 backdrop-blur-md">
        <PageWrapper>
          <div className="py-5">
            {/* Header row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
                  Database
                </p>
                <h1
                  className="text-2xl font-extrabold text-text-primary sm:text-3xl"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  Browse Cars
                </h1>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:max-w-xs">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search make, model, generation..."
                  className="w-full rounded-lg border border-border bg-bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/25"
                />
              </div>
            </div>

            {/* Filter rows */}
            <div className="mt-4 flex flex-col gap-3">
              {/* Make filter */}
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
                  Make
                </p>
                <CategoryFilter
                  categories={makes}
                  active={activeMake}
                  onChange={setActiveMake}
                />
              </div>

              {/* Body Style + Drivetrain on same row at larger screens */}
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                <div className="sm:flex-1">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
                    Body Style
                  </p>
                  <CategoryFilter
                    categories={bodyStyles}
                    active={activeBody}
                    onChange={setActiveBody}
                  />
                </div>
                <div className="sm:flex-1">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
                    Drivetrain
                  </p>
                  <CategoryFilter
                    categories={drivetrains}
                    active={activeDrivetrain}
                    onChange={setActiveDrivetrain}
                  />
                </div>
              </div>
            </div>

            {/* Results counter + clear */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                <span className="font-bold tabular-nums text-text-primary">
                  {filteredCars.length}
                </span>{" "}
                {filteredCars.length === 1 ? "result" : "results"}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-accent transition-colors hover:text-accent-hover"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </PageWrapper>
      </div>

      {/* Car grid */}
      <PageWrapper>
        <div className="py-8">
          {filteredCars.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p
                className="text-xl font-extrabold text-text-primary"
                style={{ letterSpacing: "-0.02em" }}
              >
                No cars found
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Try adjusting your filters or search query.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 cursor-pointer rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
}
