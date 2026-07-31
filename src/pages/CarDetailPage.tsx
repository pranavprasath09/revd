import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import Marquee from "@/components/pitwall/Marquee";
import TelemetryStrip from "@/components/pitwall/TelemetryStrip";
import PWButton from "@/components/pitwall/Button";
import ScoreBar from "@/components/pitwall/ScoreBar";
import { ScoreCell } from "@/components/pitwall/ScoreBar";
import { useAuthContext } from "@/context/AuthContext";
import useGarage from "@/hooks/useGarage";
import { useCompareStore } from "@/lib/compareStore";
import { CARS, carPath } from "@/lib/carData";
import { MOD_GUIDES, RELIABILITY, severityColor } from "@/lib/guides";
import { reliabilityColor } from "@/lib/themes";
import type { Car, CarTrim } from "@/types/car";

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-");
}

function findCar(make?: string, model?: string, year?: string): Car | undefined {
  if (!make || !model || !year) return undefined;
  return CARS.find(
    (c) =>
      slugify(c.make) === make &&
      slugify(c.model) === model &&
      c.years.split("–")[0] === year,
  );
}

const SECTION_LABEL =
  "font-mono text-[9px] uppercase tracking-[0.24em] text-text-secondary";
const HEAD_ROW =
  "grid h-[30px] items-center border-b border-accent font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary";
const BODY_ROW =
  "grid items-center border-b border-border-hair transition-colors duration-100 hover:bg-bg-elevated";

function peakEngine(car: Car) {
  let best = car.engines[0];
  for (const e of car.engines) {
    if (parseInt(e.power, 10) > parseInt(best?.power ?? "0", 10)) best = e;
  }
  return best;
}

const TIER_LABELS: Record<CarTrim["tier"], string> = {
  base: "Base",
  mid: "Mid",
  performance: "Perf",
  flagship: "Flagship",
};

export default function CarDetailPage() {
  const { make, model, year } = useParams<{
    make: string;
    model: string;
    year: string;
  }>();
  const navigate = useNavigate();
  const { user, isPremium } = useAuthContext();
  const { addCar, cars: garageCars } = useGarage();
  const { ids: trayIds, toggle } = useCompareStore();
  const [garageState, setGarageState] = useState<"idle" | "adding" | "added">(
    "idle",
  );

  const car = useMemo(() => findCar(make, model, year), [make, model, year]);

  const otherGens = useMemo(
    () =>
      car
        ? CARS.filter(
            (c) =>
              slugify(c.make) === slugify(car.make) &&
              slugify(c.model) === slugify(car.model) &&
              c.id !== car.id,
          )
        : [],
    [car],
  );

  const related = useMemo(() => {
    if (!car) return [];
    const sameMake = CARS.filter((c) => c.make === car.make && c.id !== car.id);
    const sameTags = CARS.filter(
      (c) =>
        c.id !== car.id &&
        c.make !== car.make &&
        c.tags.some((t) => car.tags.includes(t)),
    );
    const seen = new Set<string>();
    const out: Car[] = [];
    for (const c of [...sameMake, ...sameTags]) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        out.push(c);
      }
      if (out.length >= 4) break;
    }
    return out;
  }, [car]);

  if (!car) {
    return (
      <div className="page-enter px-6 pb-[72px] pt-[34px] md:px-11">
        <SEOHead title="Car not found" description="No car at this address." />
        <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-signal-red">
          Error
        </div>
        <h1 className="mt-2 font-mono text-[56px] font-bold leading-[0.9] tracking-[-0.045em] md:text-[96px]">
          404
        </h1>
        <p className="mt-4 max-w-[460px] text-[15px] leading-relaxed text-text-secondary">
          No car at that address. It may have been removed, or the URL may be
          wrong.
        </p>
        <div className="mt-7 flex gap-[22px]">
          <Link
            to="/cars"
            className="border-b border-accent pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent"
          >
            Browse cars
          </Link>
        </div>
      </div>
    );
  }

  const engine = peakEngine(car);
  const rel = RELIABILITY.get(car.id);
  const mods = MOD_GUIDES.get(car.id);
  const inGarage = garageCars.some(
    (gc) => gc.carId === car.id || gc.carId === car.slug,
  );
  const inTray = trayIds.includes(car.id);
  const powerPerTonne = Math.round(
    (parseInt(engine?.power ?? "0", 10) / car.performance.weight_kg) * 1000,
  );

  const handleAddToGarage = async () => {
    if (!user) {
      navigate(`/sign-in?redirect=${carPath(car)}`);
      return;
    }
    if (inGarage || garageState !== "idle") return;
    setGarageState("adding");
    const error = await addCar(car.id);
    setGarageState(error ? "idle" : "added");
  };

  return (
    <div className="page-enter pb-[72px]">
      <SEOHead
        title={`${car.make} ${car.model} ${car.generation}`}
        description={`${car.make} ${car.model} ${car.generation} (${car.years}) — specs, engines, reliability, and known faults.`}
      />

      {/* Marquee — generation code as the headline */}
      <Marquee
        image={car.heroImage}
        alt={`${car.make} ${car.model} ${car.generation}`}
        kicker={
          <span className="flex items-center gap-2.5">
            <Link to="/cars" className="hover:text-accent-hover">
              Cars
            </Link>
            <span className="text-text-muted">/</span>
            <span className="text-text-secondary">{car.make}</span>
            <span className="text-text-muted">/</span>
            <span>{car.model}</span>
          </span>
        }
        kickerInfo={`${car.years} · ${engine?.code ?? ""}`}
        code={car.generation}
        name={`${car.make} ${car.model}`}
        tags={car.tags}
      />

      {/* Headline spec strip */}
      <TelemetryStrip
        live={false}
        cellMinWidth={148}
        cells={[
          { label: "Power", value: engine?.power ?? "—" },
          { label: "Torque", value: engine?.torque ?? "—" },
          { label: "0–100", value: car.performance["0_to_100_kph"] },
          { label: "Top speed", value: `${car.performance.top_speed_kph}km/h` },
          { label: "Mass", value: `${car.performance.weight_kg}kg` },
          { label: "Power / tonne", value: `${powerPerTonne}hp` },
        ]}
      />

      <div className="grid lg:grid-cols-[1fr_380px]">
        {/* ── Left column ── */}
        <div className="min-w-0 px-6 pt-[30px] md:px-11">
          {/* Engine variants */}
          <div className={`${SECTION_LABEL} pb-2.5`}>Engine variants</div>
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              <div
                className={HEAD_ROW}
                style={{
                  gridTemplateColumns: "148px 78px 1fr 88px 92px 116px",
                }}
              >
                <span>Code</span>
                <span>Disp.</span>
                <span>Configuration</span>
                <span>Power</span>
                <span>Torque</span>
                <span>Variants</span>
              </div>
              {car.engines.map((e) => (
                <div
                  key={e.code}
                  className={`${BODY_ROW} h-10`}
                  style={{
                    gridTemplateColumns: "148px 78px 1fr 88px 92px 116px",
                  }}
                >
                  <span className="font-mono text-xs font-semibold text-accent">
                    {e.code}
                  </span>
                  <span className="font-mono text-xs text-text-primary">
                    {e.displacement}
                  </span>
                  <span className="text-[13px] text-text-secondary">
                    {e.configuration}
                  </span>
                  <span className="font-mono text-[13px] text-text-primary">
                    {e.power}
                  </span>
                  <span className="font-mono text-[13px] text-text-primary">
                    {e.torque}
                  </span>
                  <span className="truncate font-mono text-[11px] text-text-secondary">
                    {e.variants.join(", ")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Trims — same sheet discipline */}
          {car.trims && car.trims.length > 0 && (
            <>
              <div className={`${SECTION_LABEL} pb-2.5 pt-[34px]`}>
                Trims · {car.trims.length}
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[560px]">
                  <div
                    className={HEAD_ROW}
                    style={{
                      gridTemplateColumns: "1fr 88px 92px 88px 88px 84px",
                    }}
                  >
                    <span>Trim</span>
                    <span>Tier</span>
                    <span>Power</span>
                    <span>0–100</span>
                    <span>Mass</span>
                    <span>Drive</span>
                  </div>
                  {car.trims.map((t) => (
                    <div
                      key={t.id}
                      className={`${BODY_ROW} min-h-11`}
                      style={{
                        gridTemplateColumns: "1fr 88px 92px 88px 88px 84px",
                      }}
                    >
                      <span className="flex min-w-0 items-center gap-3 py-1.5 pr-4">
                        {t.image && (
                          <img
                            src={t.image}
                            alt=""
                            loading="lazy"
                            className="h-7 w-[46px] shrink-0 object-cover grayscale-[0.4]"
                          />
                        )}
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-semibold tracking-[-0.015em] text-text-primary">
                            {t.name}
                          </span>
                          <span className="truncate font-mono text-[10px] text-text-muted">
                            {t.yearsOffered} · {t.engine.split("(")[0].trim()}
                          </span>
                        </span>
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-secondary">
                        {TIER_LABELS[t.tier]}
                      </span>
                      <span className="font-mono text-[13px] text-text-primary">
                        {t.power}
                      </span>
                      <span className="font-mono text-[13px] text-text-primary">
                        {t.zeroTo100}
                      </span>
                      <span className="font-mono text-[13px] text-text-secondary">
                        {t.weightKg}kg
                      </span>
                      <span className="font-mono text-[11px] tracking-[0.08em] text-text-secondary">
                        {t.drivetrain}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Reliability */}
          {rel && (
            <>
              <div className={`${SECTION_LABEL} pb-3 pt-[34px]`}>
                Reliability
              </div>
              <div className="flex items-center gap-3.5">
                <span
                  className="font-mono text-2xl font-semibold"
                  style={{ color: reliabilityColor(rel.overallScore) }}
                >
                  {rel.overallScore}
                </span>
                <div className="max-w-[360px] flex-1">
                  <ScoreBar score={rel.overallScore} flex height={5} />
                </div>
                <span className="font-mono text-[11px] text-text-secondary">
                  / 100
                </span>
              </div>
              <p className="mt-3.5 max-w-[620px] text-sm leading-relaxed text-text-secondary">
                {rel.summary}
              </p>

              <div className={`${SECTION_LABEL} pb-2.5 pt-[34px]`}>
                Known faults
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[560px]">
                  <div
                    className={HEAD_ROW}
                    style={{ gridTemplateColumns: "1fr 116px 148px 124px" }}
                  >
                    <span>Fault</span>
                    <span>Severity</span>
                    <span>Mileage</span>
                    <span className="text-right">Est. cost</span>
                  </div>
                  {rel.issues.map((issue) => {
                    const locked = issue.isPremium && !isPremium;
                    return (
                      <div
                        key={issue.id}
                        className={`${BODY_ROW} min-h-10 py-2`}
                        style={{ gridTemplateColumns: "1fr 116px 148px 124px" }}
                      >
                        <span className="flex min-w-0 flex-col gap-1 pr-6">
                          <span className="flex items-center gap-2.5 text-sm font-medium text-text-primary">
                            {issue.name}
                            {issue.isPremium && (
                              <span className="border border-accent px-1.5 py-px font-mono text-[8px] uppercase tracking-[0.18em] text-accent">
                                Pro
                              </span>
                            )}
                          </span>
                          {!locked && (
                            <span className="text-[13px] leading-relaxed text-text-secondary">
                              {issue.description}
                            </span>
                          )}
                        </span>
                        <span
                          className="font-mono text-[11px] uppercase tracking-[0.08em]"
                          style={{ color: severityColor(issue.severity) }}
                        >
                          {issue.severity}
                        </span>
                        <span className="font-mono text-[11px] text-text-secondary">
                          {locked ? "—" : (issue.mileageRange ?? "—")}
                        </span>
                        <span className="text-right font-mono text-[13px] text-text-primary">
                          {locked ? "—" : (issue.fixCostEstimate ?? "—")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {rel.issues.some((i) => i.isPremium) && !isPremium && (
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                  Pro faults show cost and mileage with a{" "}
                  <Link to="/premium" className="text-accent">
                    premium membership
                  </Link>
                </p>
              )}

              {rel.buyingTips.length > 0 && (
                <>
                  <div className={`${SECTION_LABEL} pb-2.5 pt-[34px]`}>
                    Buying notes
                  </div>
                  {rel.buyingTips.map((tip, i) => (
                    <div
                      key={tip}
                      className="grid grid-cols-[40px_1fr] items-baseline border-b border-border-hair py-2.5"
                    >
                      <span className="font-mono text-[10px] text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm leading-relaxed text-text-secondary">
                        {tip}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>

        {/* ── Right rail ── */}
        <div className="border-border-alpha px-6 pt-[30px] md:px-11 lg:border-l lg:pl-8 lg:pr-11">
          <div className="border border-border-alpha">
            <div className="border-b border-border-alpha px-[18px] py-3.5 font-mono text-[9px] uppercase tracking-[0.22em] text-text-secondary">
              At a glance
            </div>
            {[
              { label: "Generation", value: car.generation },
              { label: "Years", value: car.years },
              { label: "Body styles", value: car.bodyStyles.join(", ") },
              { label: "Drivetrain", value: car.performance.drivetrain },
              {
                label: "Wheelbase",
                value: `${car.dimensions.wheelbase_mm}mm`,
              },
              { label: "Reliability", value: `${car.reliabilityScore} / 100` },
              { label: "Popularity", value: `${car.popularityScore} / 100` },
            ].map((g) => (
              <div
                key={g.label}
                className="flex items-baseline justify-between gap-5 border-b border-border-hair px-[18px] py-2.5 last:border-b-0"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary">
                  {g.label}
                </span>
                <span className="text-right font-mono text-[13px] text-text-primary">
                  {g.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-[18px] flex flex-col gap-2">
            <PWButton
              onClick={handleAddToGarage}
              disabled={inGarage || garageState !== "idle"}
            >
              {inGarage || garageState === "added"
                ? "In your garage ✓"
                : garageState === "adding"
                  ? "Adding…"
                  : "Add to garage"}
            </PWButton>
            <PWButton
              variant="secondary"
              onClick={() => {
                if (!inTray) toggle(car.id);
                navigate("/compare");
              }}
            >
              {inTray ? "In the tray — compare" : "Compare"}
            </PWButton>
            <Link to={`/mods/${slugify(car.make)}/${slugify(car.model)}`}>
              <PWButton variant="quiet" className="w-full">
                Mod guides{mods ? ` · ${mods.mods.length}` : ""}
              </PWButton>
            </Link>
          </div>

          {otherGens.length > 0 && (
            <div className="mt-7">
              <div className={`${SECTION_LABEL} pb-2.5`}>Other generations</div>
              <div className="flex flex-wrap gap-1.5">
                {otherGens.map((g) => (
                  <Link
                    key={g.id}
                    to={carPath(g)}
                    className="border border-border-rule px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary transition-colors duration-100 hover:border-accent hover:text-accent"
                  >
                    {g.generation}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related cars — a compact sheet, not cards */}
      {related.length > 0 && (
        <div className="mt-14 px-6 md:px-11">
          <div className={`${SECTION_LABEL} pb-2.5`}>Related cars</div>
          <div
            className={HEAD_ROW}
            style={{ gridTemplateColumns: "1fr 88px 96px 118px" }}
          >
            <span>Car</span>
            <span>Gen</span>
            <span>Power</span>
            <span>Reliability</span>
          </div>
          {related.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(carPath(c))}
              className={`${BODY_ROW} h-11 cursor-pointer`}
              style={{ gridTemplateColumns: "1fr 88px 96px 118px" }}
            >
              <span className="flex min-w-0 items-center gap-3">
                <img
                  src={c.heroImage}
                  alt=""
                  loading="lazy"
                  className="h-7 w-[46px] shrink-0 object-cover grayscale-[0.4]"
                />
                <span className="truncate text-sm font-semibold tracking-[-0.015em] text-text-primary">
                  {c.make} {c.model}
                </span>
              </span>
              <span className="font-mono text-xs font-semibold text-accent">
                {c.generation}
              </span>
              <span className="font-mono text-[13px] text-text-primary">
                {peakEngine(c)?.power ?? "—"}
              </span>
              <ScoreCell score={c.reliabilityScore} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
