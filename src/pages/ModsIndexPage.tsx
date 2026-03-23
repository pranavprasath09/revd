import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import CategoryFilter from "@/components/ui/CategoryFilter";
import carsData from "@/data/cars.json";
import type { Car } from "@/types/car";

interface Mod {
  id: string;
  name: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  costEstimate: string;
  isPremium: boolean;
}

interface ModData {
  carId: string;
  make: string;
  model: string;
  generation: string;
  mods: Mod[];
}

const cars = carsData as Car[];

const modFiles: Record<string, ModData> = import.meta.glob(
  "@/data/mods/*.json",
  { eager: true, import: "default" }
) as Record<string, ModData>;

// Build slug -> mod data map
const modsMap = new Map<string, ModData>();
for (const [path, data] of Object.entries(modFiles)) {
  const filename = path.split("/").pop()?.replace(".json", "") ?? "";
  modsMap.set(filename, data);
}

// Only cars that have mod data
const carsWithMods = cars
  .filter((car) => modsMap.has(car.slug))
  .sort((a, b) => {
    const modsA = modsMap.get(a.slug)?.mods.length ?? 0;
    const modsB = modsMap.get(b.slug)?.mods.length ?? 0;
    return modsB - modsA;
  });

const ALL = "All";
const makes = [ALL, ...Array.from(new Set(carsWithMods.map((c) => c.make))).sort()];

const DIFFICULTY_FILTERS = [ALL, "Beginner", "Intermediate", "Advanced"];

/* DIFFICULTY_COLOR and DIFFICULTY_BG reserved for future use */

export default function ModsIndexPage() {
  const [activeMake, setActiveMake] = useState(ALL);
  const [activeDifficulty, setActiveDifficulty] = useState(ALL);
  const [search, setSearch] = useState("");

  const filteredCars = useMemo(() => {
    const query = search.toLowerCase().trim();

    return carsWithMods.filter((car) => {
      const data = modsMap.get(car.slug);
      if (!data) return false;

      if (query) {
        const haystack = `${car.make} ${car.model} ${car.generation}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (activeMake !== ALL && car.make !== activeMake) return false;

      if (activeDifficulty !== ALL) {
        const hasLevel = data.mods.some((m) => m.difficulty === activeDifficulty);
        if (!hasLevel) return false;
      }

      return true;
    });
  }, [search, activeMake, activeDifficulty]);

  const hasActiveFilters = search !== "" || activeMake !== ALL || activeDifficulty !== ALL;

  function clearFilters() {
    setSearch("");
    setActiveMake(ALL);
    setActiveDifficulty(ALL);
  }

  // Aggregate stats
  const totalMods = Array.from(modsMap.values()).reduce((sum, d) => sum + d.mods.length, 0);
  const totalBeginner = Array.from(modsMap.values()).reduce(
    (sum, d) => sum + d.mods.filter((m) => m.difficulty === "Beginner").length, 0
  );
  const totalAdvanced = Array.from(modsMap.values()).reduce(
    (sum, d) => sum + d.mods.filter((m) => m.difficulty === "Advanced").length, 0
  );
  /* premiumMods stat reserved for future use */

  return (
    <div className="page-enter">
      <SEOHead
        title="Car Mod Guides"
        description="Browse mod guides for the most popular enthusiast cars. From beginner bolt-ons to advanced engine builds, with part numbers and install tips."
        canonicalUrl="https://revhub.com/mods"
      />

      {/* Hero header */}
      <div className="border-b border-border bg-bg-surface/50">
        <PageWrapper>
          <div className="py-10 sm:py-14">
            <p className="font-body text-[11px] font-bold uppercase tracking-widest text-accent-red mb-3">
              Modification Database
            </p>
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-text-primary leading-none">
              Mod Guides
            </h1>
            <p className="font-body mt-3 max-w-2xl text-base text-text-secondary leading-relaxed">
              {totalMods} curated mods across {carsWithMods.length} cars. From easy bolt-ons to
              full engine builds — with part numbers and install notes for premium members.
            </p>

            {/* Quick stats */}
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="rounded-xl border border-border bg-bg-base px-5 py-3">
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Mods</p>
                <p className="font-mono text-2xl font-bold text-text-primary">{totalMods}</p>
              </div>
              <div className="rounded-xl border border-border bg-bg-base px-5 py-3">
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">Cars Covered</p>
                <p className="font-mono text-2xl font-bold text-text-primary">{carsWithMods.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-bg-base px-5 py-3">
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">Beginner Mods</p>
                <p className="font-mono text-2xl font-bold text-emerald-400">{totalBeginner}</p>
              </div>
              <div className="rounded-xl border border-border bg-bg-base px-5 py-3">
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">Advanced Builds</p>
                <p className="font-mono text-2xl font-bold text-red-400">{totalAdvanced}</p>
              </div>
            </div>
          </div>
        </PageWrapper>
      </div>

      {/* Filters */}
      <div className="sticky top-14 z-30 border-b border-border bg-bg-base/95 backdrop-blur-md md:top-0">
        <PageWrapper>
          <div className="py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              {/* Search */}
              <div className="relative w-full sm:max-w-xs">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search cars..."
                  className="font-body w-full rounded-lg border border-border bg-bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25"
                />
              </div>

              {/* Results + clear */}
              <div className="flex items-center gap-4">
                <p className="font-body text-sm text-text-secondary">
                  <span className="font-mono font-bold tabular-nums text-text-primary">{filteredCars.length}</span>{" "}
                  {filteredCars.length === 1 ? "car" : "cars"}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-accent-red transition-colors hover:text-accent-hover"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Filter rows */}
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:gap-6">
              <div className="sm:flex-1">
                <p className="font-body mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">Make</p>
                <CategoryFilter categories={makes} active={activeMake} onChange={setActiveMake} />
              </div>
              <div className="sm:flex-1">
                <p className="font-body mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">Difficulty</p>
                <CategoryFilter categories={DIFFICULTY_FILTERS} active={activeDifficulty} onChange={setActiveDifficulty} />
              </div>
            </div>
          </div>
        </PageWrapper>
      </div>

      {/* Car grid */}
      <PageWrapper>
        <div className="py-8">
          {filteredCars.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCars.map((car, index) => {
                const data = modsMap.get(car.slug)!;
                const beginnerCount = data.mods.filter((m) => m.difficulty === "Beginner").length;
                const intermediateCount = data.mods.filter((m) => m.difficulty === "Intermediate").length;
                const advancedCount = data.mods.filter((m) => m.difficulty === "Advanced").length;

                return (
                  <Link
                    key={car.id}
                    to={`/mods/${car.make.toLowerCase()}/${car.model.toLowerCase().replace(/\s+/g, "-")}`}
                    className="card-corner group relative overflow-hidden rounded-xl border border-border bg-bg-surface transition-all duration-300 animate-fade-up hover:-translate-y-1 hover:border-accent-red/30 hover:shadow-xl hover:shadow-accent-red/10"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    {/* Car image */}
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={car.heroImage}
                        alt={`${car.make} ${car.model} ${car.generation}`}
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80"; }}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-bg-surface/20 to-transparent" />

                      {/* Mod count overlay */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-bg-base/90 px-3 py-1.5 backdrop-blur-sm">
                        <svg
                          className="h-4 w-4 text-accent-red"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                        </svg>
                        <span className="font-mono text-sm font-bold text-text-primary">
                          {data.mods.length}
                        </span>
                        <span className="font-body text-[9px] font-bold uppercase tracking-wider text-text-muted">
                          mods
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-display text-xl uppercase tracking-wide text-text-primary group-hover:text-accent-red transition-colors">
                        {car.make} {car.model}
                      </h3>
                      <p className="font-body text-xs font-medium text-text-muted mt-0.5">
                        {car.generation} · {car.years}
                      </p>

                      {/* Difficulty breakdown bar */}
                      <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated/50">
                        {beginnerCount > 0 && (
                          <div
                            className="h-full bg-emerald-400"
                            style={{ width: `${(beginnerCount / data.mods.length) * 100}%` }}
                          />
                        )}
                        {intermediateCount > 0 && (
                          <div
                            className="h-full bg-amber-400"
                            style={{ width: `${(intermediateCount / data.mods.length) * 100}%` }}
                          />
                        )}
                        {advancedCount > 0 && (
                          <div
                            className="h-full bg-red-400"
                            style={{ width: `${(advancedCount / data.mods.length) * 100}%` }}
                          />
                        )}
                      </div>

                      {/* Difficulty counts */}
                      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                        <div className="flex items-center gap-3">
                          {beginnerCount > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-emerald-400" />
                              <span className="font-mono text-[11px] font-bold text-text-secondary">{beginnerCount}</span>
                            </div>
                          )}
                          {intermediateCount > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-amber-400" />
                              <span className="font-mono text-[11px] font-bold text-text-secondary">{intermediateCount}</span>
                            </div>
                          )}
                          {advancedCount > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-red-400" />
                              <span className="font-mono text-[11px] font-bold text-text-secondary">{advancedCount}</span>
                            </div>
                          )}
                        </div>
                        <span className="font-body text-[11px] font-semibold text-accent-red group-hover:text-accent-hover transition-colors">
                          View guide →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="font-display text-xl uppercase tracking-wide text-text-primary">No cars found</p>
              <p className="mt-2 text-sm text-text-secondary">Try adjusting your filters or search query.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 cursor-pointer rounded-lg bg-accent-red px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}
