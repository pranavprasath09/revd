import { useState, useEffect } from "react";
import type { Car, CarTrim, TrimTier } from "@/types/car";

const TIER_LABELS: Record<TrimTier, string> = {
  base: "Base",
  mid: "Volume Seller",
  performance: "Performance",
  flagship: "Flagship",
};

function tierBadgeClasses(tier: TrimTier): string {
  switch (tier) {
    case "flagship":
      return "bg-accent-red text-white";
    case "performance":
      return "bg-accent-red/15 text-accent-red";
    case "mid":
      return "bg-bg-elevated text-text-secondary";
    case "base":
      return "bg-bg-elevated text-text-muted";
  }
}

interface TrimSectionProps {
  car: Car;
}

/**
 * Clickable trim-level breakdown: pick a trim, see its real specs, what it
 * adds over lower trims, and a flagship fact. Specs are trim-verified data
 * from cars.json; the image falls back to the generation hero shot unless a
 * trim-specific press image has been provided.
 */
export default function TrimSection({ car }: TrimSectionProps) {
  const trims = car.trims ?? [];
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset selection when navigating between cars
  useEffect(() => {
    setActiveIndex(0);
  }, [car.id]);

  if (trims.length === 0) return null;

  const trim: CarTrim = trims[Math.min(activeIndex, trims.length - 1)];
  const powerToWeight = (
    parseInt(trim.power) / (trim.weightKg / 1000)
  ).toFixed(0);

  const stats = [
    { label: "Power", value: trim.power },
    { label: "Torque", value: trim.torque },
    { label: "0–100 km/h", value: trim.zeroTo100 },
    { label: "Top Speed", value: `${trim.topSpeedKph} km/h` },
    { label: "Weight", value: `${trim.weightKg} kg` },
    { label: "Power/Ton", value: `${powerToWeight} hp` },
  ];

  return (
    <section>
      <h2 className="section-label mb-4">Trims &amp; Variants</h2>

      {/* Trim tabs */}
      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-border bg-bg-surface p-1">
        {trims.map((t, index) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`relative cursor-pointer whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              index === activeIndex
                ? "bg-bg-elevated text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <span className="font-display uppercase">{t.name}</span>
            <span className="font-mono ml-2 text-xs text-text-muted">
              {t.power}
            </span>
            {index === activeIndex && (
              <div className="absolute bottom-0 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-accent-red" />
            )}
          </button>
        ))}
      </div>

      {/* Selected trim panel */}
      <div className="overflow-hidden rounded-xl border border-border bg-bg-surface">
        {/* Trim image */}
        <div className="relative aspect-[21/9] overflow-hidden">
          <img
            src={trim.image ?? car.heroImage}
            alt={`${car.make} ${car.model} ${trim.name}`}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = car.heroImage;
            }}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span className="font-display text-2xl uppercase tracking-wide text-white">
              {trim.name}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider ${tierBadgeClasses(trim.tier)}`}
            >
              {TIER_LABELS[trim.tier]}
            </span>
          </div>
          {!trim.image && (
            <span className="absolute bottom-3 right-4 font-body text-[10px] uppercase tracking-wider text-white/60">
              Generation photo
            </span>
          )}
        </div>

        <div className="p-5 sm:p-6">
          {/* Drivetrain line */}
          <p className="font-body text-sm text-text-secondary">
            <span className="text-text-primary font-semibold">{trim.engine}</span>
            {" · "}{trim.transmission}{" · "}{trim.drivetrain}{" · "}{trim.yearsOffered}
          </p>

          {/* Stat grid */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-border bg-bg-base px-3 py-2.5"
              >
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  {s.label}
                </p>
                <p className="font-mono mt-0.5 text-sm font-bold text-text-primary">
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* What this trim offers */}
          {trim.highlights.length > 0 && (
            <div className="mt-6">
              <h3 className="font-body text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                What the {trim.name} offers
              </h3>
              <ul className="space-y-2">
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
            </div>
          )}

          {/* Fun fact */}
          {trim.funFact && (
            <div className="mt-6 rounded-lg border border-accent-red/25 bg-accent-red/5 px-4 py-3">
              <p className="font-body text-[10px] font-bold uppercase tracking-wider text-accent-red mb-1">
                Did you know
              </p>
              <p className="font-body text-sm leading-relaxed text-text-secondary">
                {trim.funFact}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
