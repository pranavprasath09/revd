import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageHeader from "@/components/pitwall/PageHeader";
import FilterBar from "@/components/pitwall/FilterBar";
import Sheet, { PosCell, type SheetColumn } from "@/components/pitwall/Sheet";
import { useAuthContext } from "@/context/AuthContext";
import { CARS } from "@/lib/carData";
import {
  MOD_GUIDES,
  difficultyBar,
  difficultyLevel,
  type ModGuideEntry,
} from "@/lib/guides";
import type { Car } from "@/types/car";

const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

interface GuideRow {
  key: string;
  mod: ModGuideEntry;
  car: Car;
}

// Every guide across every car, flattened onto one sheet
const ALL_GUIDES: GuideRow[] = CARS.filter((c) => MOD_GUIDES.has(c.id)).flatMap(
  (car) =>
    MOD_GUIDES.get(car.id)!.mods.map((mod) => ({
      key: `${car.id}-${mod.id}`,
      mod,
      car,
    })),
);

const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];

function diffColor(level: number): string {
  if (level >= 4) return "var(--color-signal-red)";
  if (level >= 3) return "var(--color-accent)";
  return "var(--color-text-secondary)";
}

export default function ModsIndexPage() {
  const navigate = useNavigate();
  const { isPremium } = useAuthContext();
  const [difficulty, setDifficulty] = useState("All");

  const rows = useMemo(
    () =>
      ALL_GUIDES.filter(
        (r) => difficulty === "All" || r.mod.difficulty === difficulty,
      ),
    [difficulty],
  );

  const columns: SheetColumn<GuideRow>[] = [
    { key: "no", label: "No", width: "44px", render: (_, i) => <PosCell index={i} /> },
    {
      key: "guide",
      label: "Guide",
      width: "1fr",
      render: (r) => (
        <span className="flex min-w-0 flex-col gap-0.5 pr-6">
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-semibold tracking-[-0.015em] text-text-primary">
            {r.mod.name}
          </span>
          <span className="font-mono text-[10px] text-text-secondary">
            {r.mod.difficulty}
          </span>
        </span>
      ),
    },
    {
      key: "car",
      label: "Car",
      width: "176px",
      optional: true,
      render: (r) => (
        <span className="text-[13px] text-text-secondary">
          {r.car.make} {r.car.model}
        </span>
      ),
    },
    {
      key: "gen",
      label: "Gen",
      width: "88px",
      optional: true,
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-accent">
          {r.car.generation}
        </span>
      ),
    },
    {
      key: "difficulty",
      label: "Difficulty",
      width: "132px",
      render: (r) => {
        const level = difficultyLevel(r.mod.difficulty);
        return (
          <span
            className="font-mono text-[13px] tracking-[0.16em]"
            style={{ color: diffColor(level) }}
            aria-label={`Difficulty ${level} of 5`}
          >
            {difficultyBar(level)}
          </span>
        );
      },
    },
    {
      key: "cost",
      label: "Est. cost",
      width: "128px",
      optional: true,
      render: (r) => (
        <span className="font-mono text-[13px] text-text-primary">
          {r.mod.costEstimate}
        </span>
      ),
    },
    {
      key: "access",
      label: "Access",
      width: "96px",
      align: "right",
      render: (r) =>
        r.mod.isPremium ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
            Pro
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            Free
          </span>
        ),
    },
  ];

  return (
    <div className="page-enter pb-[72px]">
      <SEOHead
        title="Mod Guides"
        description="Step-by-step mod guides with real part costs and honest difficulty ratings."
        canonicalUrl="https://revhub.com/mods"
      />

      <PageHeader
        kicker="Written by owners"
        title="MOD GUIDES"
        support="Step-by-step, with real part costs and honest difficulty out of five."
        right={
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            {isPremium
              ? `Pro · all ${ALL_GUIDES.length} guides`
              : `${ALL_GUIDES.filter((g) => !g.mod.isPremium).length} free of ${ALL_GUIDES.length}`}
          </span>
        }
      />

      <FilterBar
        label="Difficulty"
        options={DIFFICULTIES}
        value={difficulty}
        onChange={setDifficulty}
        count={rows.length}
      />

      <div className="px-6 md:px-11">
        <Sheet
          columns={columns}
          rows={rows}
          rowKey={(r) => r.key}
          rowHeight={52}
          onRowClick={(r) =>
            navigate(`/mods/${slugify(r.car.make)}/${slugify(r.car.model)}`)
          }
        />
      </div>
    </div>
  );
}
