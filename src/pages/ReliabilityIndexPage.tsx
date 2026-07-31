import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageHeader, { StatCluster } from "@/components/pitwall/PageHeader";
import FilterBar from "@/components/pitwall/FilterBar";
import Sheet, {
  CarCell,
  PosCell,
  type SheetColumn,
} from "@/components/pitwall/Sheet";
import { ScoreCell } from "@/components/pitwall/ScoreBar";
import { CARS } from "@/lib/carData";
import { RELIABILITY, type ReliabilityData } from "@/lib/guides";
import type { Car } from "@/types/car";

interface RelRow {
  car: Car;
  data: ReliabilityData;
  highCount: number;
}

const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

// Only cars with a written report appear on the sheet, ranked by score
const ALL_ROWS: RelRow[] = CARS.filter((c) => RELIABILITY.has(c.id))
  .map((car) => {
    const data = RELIABILITY.get(car.id)!;
    return {
      car,
      data,
      highCount: data.issues.filter((i) => i.severity.toLowerCase() === "high")
        .length,
    };
  })
  .sort((a, b) => b.data.overallScore - a.data.overallScore);

const MAKES = ["All", ...Array.from(new Set(ALL_ROWS.map((r) => r.car.make))).sort()];

export default function ReliabilityIndexPage() {
  const navigate = useNavigate();
  const [make, setMake] = useState("All");

  const rows = useMemo(
    () => ALL_ROWS.filter((r) => make === "All" || r.car.make === make),
    [make],
  );

  const median = useMemo(() => {
    const scores = ALL_ROWS.map((r) => r.data.overallScore).sort((a, b) => a - b);
    return scores.length ? scores[Math.floor(scores.length / 2)] : 0;
  }, []);

  const columns: SheetColumn<RelRow>[] = [
    { key: "pos", label: "Pos", width: "44px", render: (_, i) => <PosCell index={i} /> },
    {
      key: "car",
      label: "Car",
      width: "1fr",
      render: (r) => (
        <CarCell
          hero={r.car.heroImage}
          name={`${r.car.make} ${r.car.model}`}
        />
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
      key: "years",
      label: "Years",
      width: "116px",
      optional: true,
      render: (r) => (
        <span className="font-mono text-[11px] text-text-secondary">
          {r.car.years}
        </span>
      ),
    },
    {
      key: "score",
      label: "Score",
      width: "176px",
      render: (r) => (
        <ScoreCell score={r.data.overallScore} flex height={5} emphasize />
      ),
    },
    {
      key: "faults",
      label: "Faults",
      width: "108px",
      optional: true,
      render: (r) => (
        <span className="font-mono text-[13px] text-text-secondary">
          {r.data.issues.length} known
        </span>
      ),
    },
    {
      key: "high",
      label: "High sev.",
      width: "92px",
      align: "right",
      optional: true,
      render: (r) => (
        <span
          className="font-mono text-[13px]"
          style={{
            color:
              r.highCount > 0
                ? "var(--color-signal-red)"
                : "var(--color-text-muted)",
          }}
        >
          {r.highCount}
        </span>
      ),
    },
  ];

  return (
    <div className="page-enter pb-[72px]">
      <SEOHead
        title="Reliability"
        description="Reliability scores and known faults for every car on file, ranked."
        canonicalUrl="https://revhub.com/reliability"
      />

      <PageHeader
        kicker="Owner reports"
        title="RELIABILITY"
        support="Scores are aggregated from documented issues, weighted by severity. Green is 80+, red is under 65."
        right={
          <StatCluster
            stats={[
              { label: "Cars scored", value: String(ALL_ROWS.length) },
              {
                label: "Median",
                value: String(median),
                color: "var(--color-accent)",
              },
            ]}
          />
        }
      />

      <FilterBar
        label="Make"
        options={MAKES}
        value={make}
        onChange={setMake}
        count={rows.length}
        sortLabel="score"
      />

      <div className="px-6 md:px-11">
        <Sheet
          columns={columns}
          rows={rows}
          rowKey={(r) => r.car.id}
          onRowClick={(r) =>
            navigate(`/reliability/${slugify(r.car.make)}/${slugify(r.car.model)}`)
          }
        />
      </div>
    </div>
  );
}
