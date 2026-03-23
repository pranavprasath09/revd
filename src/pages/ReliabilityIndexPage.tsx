import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import CategoryFilter from "@/components/ui/CategoryFilter";
import carsData from "@/data/cars.json";
import type { Car } from "@/types/car";

interface ReliabilityData {
  carId: string;
  make: string;
  model: string;
  generation: string;
  overallScore: number;
  summary: string;
  issues: { id: string; severity: string }[];
}

const cars = carsData as Car[];

const reliabilityFiles: Record<string, ReliabilityData> = import.meta.glob(
  "@/data/reliability/*.json",
  { eager: true, import: "default" }
) as Record<string, ReliabilityData>;

// Build a map of slug -> reliability data
const reliabilityMap = new Map<string, ReliabilityData>();
for (const [path, data] of Object.entries(reliabilityFiles)) {
  const filename = path.split("/").pop()?.replace(".json", "") ?? "";
  reliabilityMap.set(filename, data);
}

// Only show cars that have reliability data
const carsWithReliability = cars
  .filter((car) => reliabilityMap.has(car.slug))
  .sort((a, b) => {
    const scoreA = reliabilityMap.get(a.slug)?.overallScore ?? 0;
    const scoreB = reliabilityMap.get(b.slug)?.overallScore ?? 0;
    return scoreB - scoreA;
  });

const ALL = "All";
const makes = [ALL, ...Array.from(new Set(carsWithReliability.map((c) => c.make))).sort()];

const SCORE_RANGES = [ALL, "75+", "50–74", "Below 50"];

function getScoreColor(score: number): string {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-red-400";
}

function getScoreBg(score: number): string {
  if (score >= 75) return "bg-emerald-400";
  if (score >= 50) return "bg-amber-400";
  return "bg-red-400";
}

/* getScoreLabel and ScoreBadge reserved for future use */

export default function ReliabilityIndexPage() {
  const [activeMake, setActiveMake] = useState(ALL);
  const [activeRange, setActiveRange] = useState(ALL);
  const [search, setSearch] = useState("");

  const filteredCars = useMemo(() => {
    const query = search.toLowerCase().trim();

    return carsWithReliability.filter((car) => {
      const data = reliabilityMap.get(car.slug);
      if (!data) return false;

      if (query) {
        const haystack = `${car.make} ${car.model} ${car.generation}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (activeMake !== ALL && car.make !== activeMake) return false;

      if (activeRange !== ALL) {
        const score = data.overallScore;
        if (activeRange === "75+" && score < 75) return false;
        if (activeRange === "50–74" && (score < 50 || score >= 75)) return false;
        if (activeRange === "Below 50" && score >= 50) return false;
      }

      return true;
    });
  }, [search, activeMake, activeRange]);

  const hasActiveFilters = search !== "" || activeMake !== ALL || activeRange !== ALL;

  function clearFilters() {
    setSearch("");
    setActiveMake(ALL);
    setActiveRange(ALL);
  }

  // Stats
  const avgScore = Math.round(
    carsWithReliability.reduce((sum, c) => sum + (reliabilityMap.get(c.slug)?.overallScore ?? 0), 0) /
      carsWithReliability.length
  );
  const highCount = carsWithReliability.filter((c) => (reliabilityMap.get(c.slug)?.overallScore ?? 0) >= 75).length;
  const totalIssues = Array.from(reliabilityMap.values()).reduce((sum, d) => sum + d.issues.length, 0);

  return (
    <div className="page-enter">
      <SEOHead
        title="Car Reliability Reports"
        description="Browse reliability scores, common issues, and buying tips for the most popular enthusiast cars. Data-driven reports for every generation."
        canonicalUrl="https://revhub.com/reliability"
      />

      {/* Hero header */}
      <div className="border-b border-border bg-bg-surface/50">
        <PageWrapper>
          <div className="py-10 sm:py-14">
            <p className="font-body text-[11px] font-bold uppercase tracking-widest text-accent-red mb-3">
              Reliability Database
            </p>
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-text-primary leading-none">
              Reliability Reports
            </h1>
            <p className="font-body mt-3 max-w-2xl text-base text-text-secondary leading-relaxed">
              Real-world reliability data for {carsWithReliability.length} enthusiast cars. Scores, common issues,
              severity ratings, and what to look for when buying.
            </p>

            {/* Quick stats */}
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="rounded-xl border border-border bg-bg-base px-5 py-3">
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">Cars Rated</p>
                <p className="font-mono text-2xl font-bold text-text-primary">{carsWithReliability.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-bg-base px-5 py-3">
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">Avg Score</p>
                <p className={`font-mono text-2xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}</p>
              </div>
              <div className="rounded-xl border border-border bg-bg-base px-5 py-3">
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">75+ Rated</p>
                <p className="font-mono text-2xl font-bold text-emerald-400">{highCount}</p>
              </div>
              <div className="rounded-xl border border-border bg-bg-base px-5 py-3">
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">Issues Tracked</p>
                <p className="font-mono text-2xl font-bold text-text-primary">{totalIssues}</p>
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
                <p className="font-body mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">Score Range</p>
                <CategoryFilter categories={SCORE_RANGES} active={activeRange} onChange={setActiveRange} />
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
                const data = reliabilityMap.get(car.slug)!;
                const highIssues = data.issues.filter((i) => i.severity === "High").length;
                const medIssues = data.issues.filter((i) => i.severity === "Medium").length;

                return (
                  <Link
                    key={car.id}
                    to={`/reliability/${car.make.toLowerCase()}/${car.model.toLowerCase().replace(/\s+/g, "-")}`}
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

                      {/* Score overlay */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-bg-base/90 px-3 py-1.5 backdrop-blur-sm">
                        <span className={`font-mono text-xl font-bold ${getScoreColor(data.overallScore)}`}>
                          {data.overallScore}
                        </span>
                        <span className="font-body text-[9px] font-bold uppercase tracking-wider text-text-muted">
                          / 100
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

                      {/* Score bar */}
                      <div className="mt-3 h-1.5 w-full rounded-full bg-bg-elevated/50 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getScoreBg(data.overallScore)} transition-all duration-700`}
                          style={{ width: `${data.overallScore}%` }}
                        />
                      </div>

                      {/* Issue counts */}
                      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                        <div className="flex items-center gap-3">
                          {highIssues > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-red-400" />
                              <span className="font-mono text-[11px] font-bold text-text-secondary">{highIssues} high</span>
                            </div>
                          )}
                          {medIssues > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-amber-400" />
                              <span className="font-mono text-[11px] font-bold text-text-secondary">{medIssues} med</span>
                            </div>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-text-muted">
                          {data.issues.length} issues
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
