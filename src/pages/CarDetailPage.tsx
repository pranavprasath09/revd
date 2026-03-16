import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import CarHero from "@/components/cars/CarHero";
import SpecsTable from "@/components/cars/SpecsTable";
import GenerationSelector from "@/components/cars/GenerationSelector";
import CarCard from "@/components/cars/CarCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import carsData from "@/data/cars.json";
import type { Car, CarEngine } from "@/types/car";

interface ModEntry {
  id: string;
  name: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  costEstimate: string;
  isPremium: boolean;
}

interface ModData {
  carId: string;
  mods: ModEntry[];
}

interface ReliabilityData {
  carId: string;
  overallScore: number;
  summary: string;
  issues: Array<{ name: string; description: string; severity: string }>;
  buyingTips: string[];
}

const cars = carsData as Car[];

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-");
}

function findCar(make: string, model: string, year: string): Car | undefined {
  return cars.find((c) => {
    const makeMatch = slugify(c.make) === make;
    const modelMatch = slugify(c.model) === model;
    const yearStart = c.years.split("\u2013")[0];
    return makeMatch && modelMatch && yearStart === year;
  });
}

function getRelatedGenerations(car: Car): Car[] {
  return cars.filter(
    (c) =>
      slugify(c.make) === slugify(car.make) &&
      slugify(c.model) === slugify(car.model) &&
      c.id !== car.id,
  );
}

function getRelatedCars(car: Car): Car[] {
  // Same make first, then overlapping tags
  const sameMake = cars.filter(
    (c) => c.make === car.make && c.id !== car.id,
  );
  const sameTagCars = cars.filter((c) => {
    if (c.id === car.id || c.make === car.make) return false;
    return c.tags.some((tag) => car.tags.includes(tag));
  });

  const pool = [...sameMake, ...sameTagCars];
  // Deduplicate and limit to 3
  const seen = new Set<string>();
  const result: Car[] = [];
  for (const c of pool) {
    if (!seen.has(c.id)) {
      seen.add(c.id);
      result.push(c);
    }
    if (result.length >= 3) break;
  }
  return result;
}

function getScoreColor(score: number): string {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-red-400";
}

function getScoreRingColor(score: number): string {
  if (score >= 75) return "stroke-emerald-400";
  if (score >= 50) return "stroke-amber-400";
  return "stroke-red-400";
}

function getScoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Average";
  if (score >= 50) return "Below Average";
  return "Poor";
}

function ReliabilityGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 120 120" className="-rotate-90">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-border"
        />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${getScoreRingColor(score)} transition-all duration-700`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-black ${getScoreColor(score)}`}>
          {score}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          / 100
        </span>
      </div>
    </div>
  );
}

export default function CarDetailPage() {
  const { make, model, year } = useParams<{
    make: string;
    model: string;
    year: string;
  }>();
  const navigate = useNavigate();

  const car = useMemo(() => {
    if (!make || !model || !year) return undefined;
    return findCar(make, model, year);
  }, [make, model, year]);

  const [activeEngineIndex, setActiveEngineIndex] = useState(0);
  const [modData, setModData] = useState<ModData | null>(null);
  const [reliabilityData, setReliabilityData] =
    useState<ReliabilityData | null>(null);

  // Reset engine tab when car changes
  useEffect(() => {
    setActiveEngineIndex(0);
  }, [car?.id]);

  // Load mod data dynamically
  useEffect(() => {
    if (!car) return;
    setModData(null);

    const modules = import.meta.glob<ModData>("@/data/mods/*.json", {
      eager: false,
    });
    const path = `/src/data/mods/${car.slug}.json`;
    const loader = modules[path];

    if (loader) {
      loader().then((data) => setModData(data as ModData)).catch(() => setModData(null));
    }
  }, [car?.slug]);

  // Load reliability data dynamically
  useEffect(() => {
    if (!car) return;
    setReliabilityData(null);

    const modules = import.meta.glob<ReliabilityData>(
      "@/data/reliability/*.json",
      { eager: false },
    );
    const path = `/src/data/reliability/${car.slug}.json`;
    const loader = modules[path];

    if (loader) {
      loader()
        .then((data) => setReliabilityData(data as ReliabilityData))
        .catch(() => setReliabilityData(null));
    }
  }, [car?.slug]);

  // Not found state
  if (!car) {
    return (
      <>
        <SEOHead
          title="Car Not Found"
          description="The car you're looking for could not be found on RevHub."
        />
        <PageWrapper className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div className="text-6xl font-black text-text-muted">404</div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">
            Car not found
          </h1>
          <p className="mt-2 max-w-md text-text-secondary">
            We couldn't find a match for{" "}
            <span className="font-semibold capitalize text-text-primary">
              {year} {make?.replace(/-/g, " ")} {model?.replace(/-/g, " ")}
            </span>
            . It may not be in our database yet.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="primary" onClick={() => navigate("/cars")}>
              Browse all cars
            </Button>
            <Button variant="secondary" onClick={() => navigate("/")}>
              Go home
            </Button>
          </div>
        </PageWrapper>
      </>
    );
  }

  const yearStart = car.years.split("\u2013")[0];
  const generations = getRelatedGenerations(car);
  const allGenerations = [car, ...generations].sort((a, b) => {
    const aYear = parseInt(a.years.split("\u2013")[0], 10);
    const bYear = parseInt(b.years.split("\u2013")[0], 10);
    return aYear - bYear;
  });
  const relatedCars = getRelatedCars(car);
  const activeEngine: CarEngine = car.engines[activeEngineIndex] ?? car.engines[0];

  const handleGenerationChange = (id: string) => {
    const target = cars.find((c) => c.id === id);
    if (target) {
      const targetYear = target.years.split("\u2013")[0];
      navigate(
        `/cars/${slugify(target.make)}/${slugify(target.model)}/${targetYear}`,
      );
    }
  };

  const pageTitle = `${yearStart} ${car.make} ${car.model} ${car.generation} Specs`;
  const pageDescription = `Full specifications, reliability data, and mod guides for the ${car.years} ${car.make} ${car.model} ${car.generation}. ${activeEngine.power}, ${car.performance["0_to_100_kph"]} 0-100, ${car.performance.drivetrain}.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${yearStart} ${car.make} ${car.model}`,
    description: pageDescription,
    brand: {
      "@type": "Brand",
      name: car.make,
    },
    model: car.model,
    productionDate: car.years,
    image: car.heroImage,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Generation",
        value: car.generation,
      },
      {
        "@type": "PropertyValue",
        name: "Drivetrain",
        value: car.performance.drivetrain,
      },
      {
        "@type": "PropertyValue",
        name: "Horsepower",
        value: activeEngine.power,
      },
    ],
  };

  const engineSpecs = [
    { label: "Engine Code", value: activeEngine.code },
    { label: "Displacement", value: activeEngine.displacement },
    { label: "Configuration", value: activeEngine.configuration },
    { label: "Power", value: activeEngine.power },
    { label: "Torque", value: activeEngine.torque },
    {
      label: "Variants",
      value: activeEngine.variants.join(", "),
    },
  ];

  const performanceSpecs = [
    { label: "0-100 km/h", value: car.performance["0_to_100_kph"] },
    { label: "Top Speed", value: `${car.performance.top_speed_kph} km/h` },
    { label: "Weight", value: `${car.performance.weight_kg} kg` },
    { label: "Drivetrain", value: car.performance.drivetrain },
  ];

  const dimensionSpecs = [
    { label: "Length", value: `${car.dimensions.length_mm} mm` },
    { label: "Width", value: `${car.dimensions.width_mm} mm` },
    { label: "Height", value: `${car.dimensions.height_mm} mm` },
    { label: "Wheelbase", value: `${car.dimensions.wheelbase_mm} mm` },
  ];

  const generalSpecs = [
    { label: "Body Styles", value: car.bodyStyles.join(", ") },
    { label: "Production Years", value: car.years },
    { label: "Generation", value: car.generation },
  ];

  const previewMods = modData?.mods.slice(0, 3) ?? [];

  return (
    <div className="page-enter">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        ogImage={car.heroImage}
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <CarHero car={car} />

      <PageWrapper>
        {/* Generation selector */}
        {allGenerations.length > 1 && (
          <section className="mb-10">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-text-muted">
              Generations
            </h2>
            <GenerationSelector
              generations={allGenerations.map((g) => ({
                id: g.id,
                generation: g.generation,
                years: g.years,
              }))}
              activeId={car.id}
              onChange={handleGenerationChange}
            />
          </section>
        )}

        {/* Tags */}
        <div className="mb-10 flex flex-wrap gap-2">
          {car.tags.map((tag) => (
            <Badge key={tag} variant="tag">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Left column: specs */}
          <div className="space-y-8 lg:col-span-2">
            {/* Engine variant tabs + specs */}
            <section>
              <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-text-muted">
                Engine
              </h2>

              {/* Engine tabs */}
              {car.engines.length > 1 && (
                <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-border bg-bg-surface p-1">
                  {car.engines.map((engine, index) => (
                    <button
                      key={engine.code}
                      type="button"
                      onClick={() => setActiveEngineIndex(index)}
                      className={`relative cursor-pointer whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                        index === activeEngineIndex
                          ? "bg-bg-elevated text-text-primary shadow-sm"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <span>{engine.code}</span>
                      <span className="ml-2 text-xs text-text-muted">
                        {engine.power}
                      </span>
                      {index === activeEngineIndex && (
                        <div className="absolute bottom-0 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-accent-red" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <SpecsTable specs={engineSpecs} />
            </section>

            {/* Performance */}
            <section>
              <SpecsTable specs={performanceSpecs} title="Performance" />
            </section>

            {/* Dimensions */}
            <section>
              <SpecsTable specs={dimensionSpecs} title="Dimensions" />
            </section>

            {/* General */}
            <section>
              <SpecsTable specs={generalSpecs} title="General" />
            </section>
          </div>

          {/* Right column: sidebar */}
          <div className="space-y-8">
            {/* Reliability score */}
            <section className="rounded-xl border border-border bg-bg-surface p-6">
              <h2 className="mb-5 text-xs font-bold uppercase tracking-wider text-text-muted">
                Reliability
              </h2>
              <div className="flex flex-col items-center">
                <ReliabilityGauge score={car.reliabilityScore} />
                <span
                  className={`mt-3 text-sm font-bold uppercase tracking-wider ${getScoreColor(car.reliabilityScore)}`}
                >
                  {getScoreLabel(car.reliabilityScore)}
                </span>
                {reliabilityData && (
                  <p className="mt-3 text-center text-sm leading-relaxed text-text-secondary">
                    {reliabilityData.summary}
                  </p>
                )}
              </div>
              <Link
                to={`/reliability/${slugify(car.make)}/${slugify(car.model)}`}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-elevated"
              >
                View full reliability report
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 12l4-4-4-4" />
                </svg>
              </Link>
            </section>

            {/* Comparison CTA */}
            <section className="rounded-xl border border-border bg-bg-surface p-6">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted">
                Compare
              </h2>
              <p className="mb-5 text-sm leading-relaxed text-text-secondary">
                See how the {car.make} {car.model} {car.generation} stacks up
                against the competition side by side.
              </p>
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => navigate(`/compare?cars=${car.slug}`)}
              >
                Compare with another car
                <svg
                  className="ml-2"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Button>
            </section>

            {/* Quick facts */}
            <section className="rounded-xl border border-border bg-bg-surface p-6">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-text-muted">
                Quick Facts
              </h2>
              <dl className="space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-text-secondary">Power-to-weight</dt>
                  <dd className="text-sm font-bold text-text-primary">
                    {(
                      parseInt(activeEngine.power) / (car.performance.weight_kg / 1000)
                    ).toFixed(0)}{" "}
                    hp/ton
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                  <dt className="text-sm text-text-secondary">Engine count</dt>
                  <dd className="text-sm font-bold text-text-primary">
                    {car.engines.length} variant{car.engines.length !== 1 ? "s" : ""}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                  <dt className="text-sm text-text-secondary">Popularity</dt>
                  <dd className="text-sm font-bold text-accent-red">
                    {car.popularityScore}/100
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </div>

        {/* Mod guide preview */}
        {previewMods.length > 0 && (
          <section className="mt-14">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Mod Guides
                </h2>
                <p className="mt-1 text-lg font-bold tracking-tight text-text-primary">
                  Popular modifications for the {car.generation}
                </p>
              </div>
              <Link
                to={`/mods/${slugify(car.make)}/${slugify(car.model)}`}
                className="hidden text-sm font-semibold text-accent-red hover:text-accent-hover sm:inline-flex sm:items-center sm:gap-1"
              >
                View all mods
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 12l4-4-4-4" />
                </svg>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {previewMods.map((mod) => (
                <div
                  key={mod.id}
                  className="group rounded-xl border border-border bg-bg-surface p-5 transition-colors hover:border-accent-red/30"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <Badge variant="difficulty">{mod.difficulty}</Badge>
                    {mod.isPremium && <Badge variant="premium">Premium</Badge>}
                  </div>
                  <h3 className="text-base font-bold tracking-tight text-text-primary">
                    {mod.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                    {mod.description}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-text-muted">
                    {mod.costEstimate}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 sm:hidden">
              <Link
                to={`/mods/${slugify(car.make)}/${slugify(car.model)}`}
                className="flex items-center justify-center gap-1 rounded-xl border border-border py-3 text-sm font-semibold text-text-primary hover:bg-bg-elevated"
              >
                View all mods
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 12l4-4-4-4" />
                </svg>
              </Link>
            </div>
          </section>
        )}

        {/* Related cars */}
        {relatedCars.length > 0 && (
          <section className="mt-14 border-t border-border pt-10">
            <h2 className="mb-1 text-xs font-bold uppercase tracking-wider text-text-muted">
              You might also like
            </h2>
            <p className="mb-6 text-lg font-bold tracking-tight text-text-primary">
              Related cars
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCars.map((related) => (
                <CarCard key={related.id} car={related} />
              ))}
            </div>
          </section>
        )}
      </PageWrapper>
    </div>
  );
}
