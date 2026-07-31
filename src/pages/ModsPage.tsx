import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageHeader, { StatCluster } from "@/components/pitwall/PageHeader";
import PWButton from "@/components/pitwall/Button";
import { useAuthContext } from "@/context/AuthContext";
import { CARS, carPath } from "@/lib/carData";
import {
  MOD_GUIDES,
  difficultyBar,
  difficultyLevel,
} from "@/lib/guides";
import type { Car } from "@/types/car";

const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

const SECTION_LABEL =
  "font-mono text-[9px] uppercase tracking-[0.24em] text-text-secondary";

function findCar(make?: string, model?: string): Car | undefined {
  if (!make || !model) return undefined;
  return CARS.find(
    (c) => slugify(c.make) === make && slugify(c.model) === model,
  );
}

/** "$250–$400" → 250 (the low bound), for the "from $X" parts total. */
function lowBound(estimate: string): number {
  const m = estimate.replace(/,/g, "").match(/\d+/);
  return m ? Number(m[0]) : 0;
}

function diffColor(level: number): string {
  if (level >= 4) return "var(--color-signal-red)";
  if (level >= 3) return "var(--color-accent)";
  return "var(--color-text-secondary)";
}

export default function ModsPage() {
  const { make, model } = useParams();
  const { user, isPremium } = useAuthContext();

  const car = useMemo(() => findCar(make, model), [make, model]);
  const data = car ? MOD_GUIDES.get(car.id) : undefined;

  if (!car || !data) {
    return (
      <div className="page-enter px-6 pb-[72px] pt-[34px] md:px-11">
        <SEOHead title="Guide not found" description="No mod guide at this address." />
        <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-signal-red">
          Error
        </div>
        <h1 className="mt-2 font-mono text-[56px] font-bold leading-[0.9] tracking-[-0.045em] md:text-[96px]">
          404
        </h1>
        <p className="mt-4 max-w-[460px] text-[15px] leading-relaxed text-text-secondary">
          No mod guide at that address yet.
        </p>
        <div className="mt-7">
          <Link
            to="/mods"
            className="border-b border-accent pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent"
          >
            Back to the guides
          </Link>
        </div>
      </div>
    );
  }

  const partsTotal = data.mods.reduce((sum, m) => sum + lowBound(m.costEstimate), 0);
  const avgDifficulty =
    Math.round(
      (data.mods.reduce((sum, m) => sum + difficultyLevel(m.difficulty), 0) /
        Math.max(data.mods.length, 1)) *
        10,
    ) / 10;

  return (
    <div className="page-enter pb-[72px]">
      <SEOHead
        title={`${data.make} ${data.model} ${data.generation} Mod Guide`}
        description={`Complete mod guide for the ${data.make} ${data.model} (${data.generation}) — part numbers, install notes, and honest costs.`}
      />

      <PageHeader
        breadcrumb={[
          { label: "Mods" },
          { label: `${data.make} ${data.model}` },
          { label: data.generation, accent: true },
        ]}
        title={`${data.model} ${data.generation} PROGRAMME`.toUpperCase()}
        titleSize={38}
        right={
          <StatCluster
            size={20}
            stats={[
              { label: "Guides", value: String(data.mods.length) },
              { label: "Avg. difficulty", value: `${avgDifficulty}/5` },
              {
                label: "Parts from",
                value: `$${partsTotal.toLocaleString()}`,
                color: "var(--color-accent)",
              },
            ]}
          />
        }
      />

      <div className="grid border-t border-accent lg:grid-cols-[1fr_380px]">
        {/* Procedure — numbered hairline rows */}
        <div className="min-w-0 px-6 pt-2 md:px-11">
          {data.mods.map((mod, i) => {
            const locked = mod.isPremium && !isPremium;
            const level = difficultyLevel(mod.difficulty);
            return (
              <div
                key={mod.id}
                className="grid grid-cols-[52px_1fr] gap-x-4 border-b border-border-hair py-5 md:grid-cols-[52px_1fr_120px]"
              >
                <span className="font-mono text-[15px] font-bold text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="flex flex-wrap items-center gap-2.5 text-[17px] font-semibold tracking-[-0.02em] text-text-primary">
                    {mod.name}
                    {mod.isPremium && (
                      <span className="border border-accent px-1.5 py-px font-mono text-[8px] uppercase tracking-[0.18em] text-accent">
                        Pro
                      </span>
                    )}
                  </span>
                  <span className="max-w-[620px] text-sm leading-relaxed text-text-secondary">
                    {mod.description}
                  </span>
                  {!locked && mod.partNumbers && (
                    <span className="mt-1 font-mono text-[11px] text-text-secondary">
                      <span className="uppercase tracking-[0.18em] text-text-muted">
                        Parts{" "}
                      </span>
                      {mod.partNumbers}
                    </span>
                  )}
                  {!locked && mod.installNotes && (
                    <span className="max-w-[620px] text-[13px] leading-relaxed text-text-secondary">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                        Install{" "}
                      </span>
                      {mod.installNotes}
                    </span>
                  )}
                  {locked && (
                    <Link
                      to="/premium"
                      className="mt-1 w-fit font-mono text-[10px] uppercase tracking-[0.14em] text-accent hover:text-accent-hover"
                    >
                      Part numbers and install notes are Pro →
                    </Link>
                  )}
                </span>
                <span className="col-start-2 mt-2 flex flex-col gap-1 md:col-start-3 md:mt-0 md:items-end">
                  <span
                    className="font-mono text-[13px] tracking-[0.16em]"
                    style={{ color: diffColor(level) }}
                    aria-label={`Difficulty ${level} of 5`}
                  >
                    {difficultyBar(level)}
                  </span>
                  <span className="font-mono text-xs text-text-secondary">
                    {mod.costEstimate}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Parts ledger rail */}
        <div className="border-border-alpha px-6 pt-6 md:px-11 lg:border-l lg:pl-8 lg:pr-11 lg:pt-2">
          <div className={`${SECTION_LABEL} pb-2.5 pt-4`}>Parts ledger</div>
          <div className="grid h-[26px] grid-cols-[1fr_112px] items-center border-b border-border-rule font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary">
            <span>Item</span>
            <span className="text-right">Est. cost</span>
          </div>
          {data.mods.map((mod) => (
            <div
              key={mod.id}
              className="grid min-h-[34px] grid-cols-[1fr_112px] items-center border-b border-border-hair"
            >
              <span className="truncate pr-3 text-[13px] text-text-primary">
                {mod.name}
              </span>
              <span className="text-right font-mono text-xs text-text-primary">
                {mod.costEstimate}
              </span>
            </div>
          ))}
          <div className="grid h-10 grid-cols-[1fr_112px] items-center border-t border-accent">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary">
              Everything, from
            </span>
            <span className="text-right font-mono text-[15px] font-semibold text-accent">
              ${partsTotal.toLocaleString()}
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <Link to={user ? "/builds/create" : "/sign-in?redirect=/builds/create"}>
              <PWButton className="w-full">Add to a build log</PWButton>
            </Link>
            <Link to={carPath(car)}>
              <PWButton variant="quiet" className="w-full">
                Full spec sheet
              </PWButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
