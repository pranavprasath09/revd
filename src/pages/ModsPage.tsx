import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PremiumGate from "@/components/ui/PremiumGate";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import carsData from "@/data/cars.json";
import type { Car } from "@/types/car";

interface Mod {
  id: string;
  name: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  costEstimate: string;
  isPremium: boolean;
  partNumbers?: string;
  installNotes?: string;
}

interface ModData {
  carId: string;
  make: string;
  model: string;
  generation: string;
  mods: Mod[];
}

const modFiles: Record<string, ModData> = import.meta.glob(
  "@/data/mods/*.json",
  { eager: true, import: "default" }
) as Record<string, ModData>;

type DifficultyFilter = "All" | "Beginner" | "Intermediate" | "Advanced";

const DIFFICULTY_FILTERS: DifficultyFilter[] = [
  "All",
  "Beginner",
  "Intermediate",
  "Advanced",
];

const DIFFICULTY_ICONS: Record<string, string> = {
  Beginner: "Bolt-on",
  Intermediate: "Hands-on",
  Advanced: "Full build",
};

function findCar(make?: string, model?: string): Car | undefined {
  if (!make || !model) return undefined;
  const makeLower = make.toLowerCase();
  const modelLower = model.toLowerCase();
  return (carsData as Car[]).find(
    (car) =>
      car.make.toLowerCase() === makeLower &&
      car.model.toLowerCase().replace(/\s+/g, "-") === modelLower
  );
}

function findModData(slug: string): ModData | undefined {
  const entry = Object.entries(modFiles).find(([path]) =>
    path.endsWith(`/${slug}.json`)
  );
  return entry?.[1];
}

function ModCard({ mod }: { mod: Mod }) {
  const hasPremiumContent = mod.isPremium && (mod.partNumbers || mod.installNotes);

  return (
    <div className="card-corner relative rounded-xl border border-border bg-bg-surface overflow-hidden">
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <h3 className="font-display text-lg uppercase tracking-wide text-text-primary">
              {mod.name}
            </h3>
            {mod.isPremium && (
              <Badge variant="premium">Premium</Badge>
            )}
          </div>
          <Badge variant="difficulty">{mod.difficulty}</Badge>
        </div>

        {/* Description */}
        <p className="font-body text-sm leading-relaxed text-text-secondary mb-4">
          {mod.description}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <svg
              className="h-4 w-4 text-text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className="font-mono font-medium text-text-primary">{mod.costEstimate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-muted text-xs uppercase tracking-wider font-semibold">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            {DIFFICULTY_ICONS[mod.difficulty]}
          </div>
        </div>
      </div>

      {/* Premium-gated details */}
      {hasPremiumContent && (
        <div className="border-t border-border">
          <PremiumGate feature="Full Mod Guide">
            <div className="p-5 sm:p-6 space-y-4">
              {mod.partNumbers && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                    Part Numbers
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {mod.partNumbers}
                  </p>
                </div>
              )}
              {mod.installNotes && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                    Install Notes
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {mod.installNotes}
                  </p>
                </div>
              )}
            </div>
          </PremiumGate>
        </div>
      )}
    </div>
  );
}

export default function ModsPage() {
  const { make, model } = useParams();
  const [activeFilter, setActiveFilter] = useState<DifficultyFilter>("All");

  const car = useMemo(() => findCar(make, model), [make, model]);
  const modData = useMemo(
    () => (car ? findModData(car.slug) : undefined),
    [car]
  );

  const filteredMods = useMemo(() => {
    if (!modData) return [];
    if (activeFilter === "All") return modData.mods;
    return modData.mods.filter((m) => m.difficulty === activeFilter);
  }, [modData, activeFilter]);

  const displayMake = modData?.make ?? car?.make ?? make ?? "";
  const displayModel = modData?.model ?? car?.model ?? model ?? "";
  const displayGen = modData?.generation ?? car?.generation ?? "";

  const pageTitle = `${displayMake} ${displayModel}${displayGen ? ` ${displayGen}` : ""} Mod Guides`;
  const pageDescription = `Complete mod guide for the ${displayMake} ${displayModel}${displayGen ? ` (${displayGen})` : ""} — from beginner bolt-ons to advanced engine builds, with part numbers and install tips.`;

  // Car not found
  if (!car) {
    return (
      <>
        <SEOHead title="Car Not Found" description="The requested car was not found." />
        <PageWrapper>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-bg-surface border border-border">
              <svg
                className="h-8 w-8 text-text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-2">
              Car Not Found
            </h1>
            <p className="text-text-secondary mb-6 max-w-md">
              We couldn't find a car matching "{make} {model}" in our database.
            </p>
            <Link to="/cars">
              <Button variant="secondary" size="md">
                Browse All Cars
              </Button>
            </Link>
          </div>
        </PageWrapper>
      </>
    );
  }

  return (
    <div className="page-enter">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={`https://revhub.com/mods/${make}/${model}`}
      />
      {/* Hero section with car image */}
      {car && (
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <img
            src={car.heroImage}
            alt={`${displayMake} ${displayModel} ${displayGen}`}
            loading="eager"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80"; }}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-base/80 to-transparent" />
        </div>
      )}

      <PageWrapper>
        {/* Breadcrumb */}
        <div className={car ? "-mt-16 relative z-10 mb-6" : "mb-6"}>
          <div className="flex items-center gap-3 text-sm">
            <Link
              to="/mods"
              className="font-body text-text-muted hover:text-accent-red transition-colors"
            >
              Mod Guides
            </Link>
            <span className="text-text-muted">/</span>
            <span className="font-body text-text-secondary">{displayMake} {displayModel}</span>
          </div>
        </div>

        {/* Page header */}
        <header className="mb-8">
          <p className="font-body text-[11px] font-bold uppercase tracking-widest text-accent-red mb-2">
            Mod Guide
          </p>
          <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-text-primary leading-none">
            {displayMake} {displayModel}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {displayGen && (
              <span className="font-body text-lg text-text-secondary font-medium">
                {displayGen} Generation
              </span>
            )}
            {car && (
              <>
                <span className="text-text-muted">·</span>
                <span className="font-mono text-sm text-text-muted">{car.years}</span>
                <span className="text-text-muted">·</span>
                <Link
                  to={`/cars/${make}/${model}/${car.years.split("–")[0]}`}
                  className="font-body text-sm text-accent-red hover:text-accent-hover transition-colors"
                >
                  View full specs →
                </Link>
              </>
            )}
          </div>
          <p className="font-body mt-3 text-sm text-text-secondary max-w-2xl leading-relaxed">
            From easy bolt-ons to full engine builds — everything you need to
            modify your {displayMake} {displayModel}. Premium members get part
            numbers and detailed install notes.
          </p>
        </header>

        {/* No mod data state */}
        {!modData && (
          <div className="rounded-xl border border-border bg-bg-surface p-12 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-bg-elevated">
              <svg
                className="h-7 w-7 text-text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-2">
              No Mod Guides Available Yet
            </h2>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              We're working on mod guides for the {displayMake} {displayModel}.
              Check back soon — or browse our other mod guides.
            </p>
          </div>
        )}

        {/* Mod content */}
        {modData && (
          <>
            {/* Difficulty filter tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
              {DIFFICULTY_FILTERS.map((filter) => {
                const count =
                  filter === "All"
                    ? modData.mods.length
                    : modData.mods.filter((m) => m.difficulty === filter).length;
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer min-h-[44px] ${
                      isActive
                        ? "bg-accent-red text-white shadow-lg shadow-accent-red/20"
                        : "border border-border text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                    }`}
                  >
                    {filter}
                    <span
                      className={`font-mono text-xs ${
                        isActive ? "text-white/70" : "text-text-muted"
                      }`}
                    >
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Mod cards */}
            <div className="space-y-4">
              {filteredMods.map((mod) => (
                <ModCard key={mod.id} mod={mod} />
              ))}
            </div>

            {/* Empty filter state */}
            {filteredMods.length === 0 && (
              <div className="rounded-xl border border-border bg-bg-surface p-12 text-center">
                <p className="text-text-secondary">
                  No {activeFilter.toLowerCase()} mods available for this car.
                </p>
                <button
                  onClick={() => setActiveFilter("All")}
                  className="mt-3 text-sm font-semibold text-accent-red hover:text-accent-hover transition-colors cursor-pointer"
                >
                  Show all mods
                </button>
              </div>
            )}

            {/* Stats footer */}
            <div className="mt-8 flex flex-wrap gap-6 rounded-xl border border-border bg-bg-surface p-5 text-center sm:text-left">
              <div>
                <p className="font-body text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5">
                  Total Mods
                </p>
                <p className="font-mono text-xl font-extrabold text-text-primary">
                  {modData.mods.length}
                </p>
              </div>
              <div>
                <p className="font-body text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5">
                  Beginner
                </p>
                <p className="font-mono text-xl font-extrabold text-emerald-400">
                  {modData.mods.filter((m) => m.difficulty === "Beginner").length}
                </p>
              </div>
              <div>
                <p className="font-body text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5">
                  Intermediate
                </p>
                <p className="font-mono text-xl font-extrabold text-amber-400">
                  {modData.mods.filter((m) => m.difficulty === "Intermediate").length}
                </p>
              </div>
              <div>
                <p className="font-body text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5">
                  Advanced
                </p>
                <p className="font-mono text-xl font-extrabold text-red-400">
                  {modData.mods.filter((m) => m.difficulty === "Advanced").length}
                </p>
              </div>
            </div>

            {/* Related guides */}
            <section className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-label">Other Mod Guides</h2>
                <Link
                  to="/mods"
                  className="font-body text-sm text-accent-red hover:text-accent-hover transition-colors"
                >
                  Browse all →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(carsData as Car[])
                  .filter((c) => c.slug !== car!.slug && findModData(c.slug))
                  .slice(0, 3)
                  .map((c) => {
                    const md = findModData(c.slug)!;
                    return (
                      <Link
                        key={c.id}
                        to={`/mods/${c.make.toLowerCase()}/${c.model.toLowerCase().replace(/\s+/g, "-")}`}
                        className="card-corner group flex items-center gap-4 rounded-xl border border-white/5 bg-bg-surface p-4 transition-all hover:border-accent-red/30 hover:shadow-lg hover:shadow-accent-red/5"
                      >
                        <img
                          src={c.heroImage}
                          alt={`${c.make} ${c.model}`}
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80"; }}
                          className="h-14 w-20 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-base uppercase tracking-wide text-text-primary group-hover:text-accent-red transition-colors truncate">
                            {c.make} {c.model}
                          </p>
                          <p className="font-mono text-xs text-text-muted">{c.generation}</p>
                        </div>
                        <div className="flex items-center gap-1">
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
                          <span className="font-mono text-sm font-bold text-text-primary">{md.mods.length}</span>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </section>
          </>
        )}
      </PageWrapper>
    </div>
  );
}
