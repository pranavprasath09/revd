import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageHeader, { StatCluster } from "@/components/pitwall/PageHeader";
import PWButton from "@/components/pitwall/Button";
import { ChipRow } from "@/components/pitwall/FilterBar";
import Sheet, {
  CarCell,
  PosCell,
  type SheetColumn,
} from "@/components/pitwall/Sheet";
import { useSheetSort } from "@/components/pitwall/useSheetSort";
import { ScoreCell } from "@/components/pitwall/ScoreBar";
import { PlateImage } from "@/components/margin/IndexList";
import { SHEET_CARS, carPath, type SheetCar } from "@/lib/carData";
import { MAX_COMPARE, useCompareStore } from "@/lib/compareStore";

const TAGS = ["All", "JDM", "European", "Muscle", "Exotic", "Legend"];
const DRIVES = ["All", "RWD", "AWD", "FWD"];

type SortKey = "pop" | "pw" | "zeroN" | "weight" | "rel";
const ASC_FIRST: SortKey[] = ["zeroN", "weight"];
const SORT_LABELS: Record<SortKey, string> = {
  pop: "popularity",
  pw: "power",
  zeroN: "0–100",
  weight: "mass",
  rel: "reliability",
};

export default function CarsPage() {
  const navigate = useNavigate();
  const [tag, setTag] = useState("All");
  const [drive, setDrive] = useState("All");
  // Hovered row drives the sticky preview plate on the right
  const [preview, setPreview] = useState<SheetCar | null>(null);
  const sort = useSheetSort<SortKey>("pop", ASC_FIRST);
  const { ids: trayIds, toggle, remove } = useCompareStore();

  const rows = useMemo(() => {
    const filtered = SHEET_CARS.filter(
      (c) =>
        (tag === "All" || c.tags.includes(tag)) &&
        (drive === "All" || c.dt === drive),
    );
    return sort.sortRows(filtered, (c, key) => c[key]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag, drive, sort.sortKey, sort.sortDir]);

  const trayCars = trayIds
    .map((id) => SHEET_CARS.find((c) => c.id === id))
    .filter((c): c is SheetCar => !!c);

  const columns: SheetColumn<SheetCar>[] = [
    {
      key: "check",
      label: "",
      width: "34px",
      render: (c) => {
        const checked = trayIds.includes(c.id);
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggle(c.id);
            }}
            role="checkbox"
            aria-checked={checked}
            aria-label={`Compare ${c.name}`}
            className={`flex h-3.5 w-3.5 cursor-pointer items-center justify-center border font-mono text-[9px] transition-colors duration-100 ${
              checked
                ? "border-accent bg-accent text-bg-base"
                : "border-border-alpha bg-transparent hover:border-accent"
            }`}
          >
            {checked ? "✓" : ""}
          </button>
        );
      },
    },
    { key: "pos", label: "Pos", width: "44px", render: (_, i) => <PosCell index={i} /> },
    {
      key: "car",
      label: "Car",
      width: "1fr",
      // Years live in the preview plate — the row keeps its width for the name
      render: (c) => <CarCell hero={c.hero} name={c.name} />,
    },
    {
      key: "gen",
      label: "Gen",
      width: "82px",
      optional: true,
      render: (c) => (
        <span className="font-mono text-xs font-semibold text-accent">{c.gen}</span>
      ),
    },
    {
      key: "pw",
      label: <>Power{sort.arrow("pw")}</>,
      width: "92px",
      sortable: true,
      optional: true,
      render: (c) => (
        <span className="font-mono text-[13px] text-text-primary">{c.power}</span>
      ),
    },
    {
      key: "zeroN",
      label: <>0–100{sort.arrow("zeroN")}</>,
      width: "88px",
      sortable: true,
      optional: true,
      render: (c) => (
        <span className="font-mono text-[13px] text-text-primary">{c.zero}</span>
      ),
    },
    {
      key: "weight",
      label: <>Mass{sort.arrow("weight")}</>,
      width: "88px",
      sortable: true,
      optional: true,
      render: (c) => (
        <span className="font-mono text-[13px] text-text-secondary">{c.weight}kg</span>
      ),
    },
    {
      key: "dt",
      label: "Drive",
      width: "84px",
      optional: true,
      render: (c) => (
        <span className="font-mono text-[11px] tracking-[0.08em] text-text-secondary">
          {c.dt}
        </span>
      ),
    },
    {
      key: "rel",
      label: <>Reliability{sort.arrow("rel")}</>,
      width: "112px",
      sortable: true,
      render: (c) => <ScoreCell score={c.rel} width={52} />,
    },
  ];

  return (
    <div className="page-enter pb-28">
      <SEOHead
        title="Cars"
        description="Browse the full RevD car database — specs, reliability, and popularity for every enthusiast car on file."
        canonicalUrl="https://revhub.com/cars"
      />

      <PageHeader
        kicker="Database"
        title="CARS"
        right={
          <StatCluster
            stats={[
              { label: "On file", value: String(SHEET_CARS.length) },
              {
                label: "Shown",
                value: String(rows.length),
                color: "var(--color-accent)",
              },
            ]}
          />
        }
      />

      {/* Two filter rows — tag and drivetrain */}
      <div className="px-6 pb-4 md:px-11">
        <ChipRow label="Tag" labelWidth={62} options={TAGS} value={tag} onChange={setTag} />
      </div>
      <div className="flex flex-wrap items-center gap-5 border-b border-border-alpha px-6 pb-[18px] md:px-11">
        <ChipRow
          label="Drive"
          labelWidth={62}
          options={DRIVES}
          value={drive}
          onChange={setDrive}
        />
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary max-md:hidden">
          Sorted by {SORT_LABELS[sort.sortKey]}
        </span>
      </div>

      <div className="grid items-start xl:grid-cols-[1fr_360px]">
        <div className="min-w-0 px-6 md:px-11 xl:pr-0">
          <Sheet
            columns={columns}
            rows={rows}
            rowKey={(c) => c.id}
            onSort={(key) => sort.toggle(key as SortKey)}
            onRowClick={(c) => navigate(carPath(c.car))}
            onRowHover={(c) => setPreview(c)}
          />
        </div>

        {/* Sticky preview plate — swaps as the pointer moves down the sheet */}
        {(() => {
          const p = preview ?? rows[0];
          if (!p) return null;
          return (
            <div className="sticky top-14 px-8 pb-14 pt-2 max-xl:hidden">
              <div className="border border-border-alpha">
                <PlateImage src={p.hero} alt={p.name} aspect="16 / 10" durationMs={250} />
                <div className="px-[18px] pb-[18px] pt-3.5">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="truncate text-base font-semibold tracking-[-0.02em] text-text-primary">
                      {p.name}
                    </span>
                    <span className="font-mono text-xs font-semibold text-accent">
                      {p.gen}
                    </span>
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-text-muted">
                    {p.years} · {p.engine}
                  </div>
                  <div className="mt-3.5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border-hair pt-3">
                    {[
                      { label: "Power", value: p.power },
                      { label: "0–100", value: p.zero },
                      { label: "Mass", value: `${p.weight}kg` },
                      { label: "Drive", value: p.dt },
                    ].map((s) => (
                      <div key={s.label}>
                        <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-text-muted">
                          {s.label}
                        </div>
                        <div className="mt-[3px] font-mono text-sm text-text-primary">
                          {s.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2 border-t border-border-hair pt-3">
                    <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-text-muted">
                      Reliability
                    </span>
                    <ScoreCell score={p.rel} flex height={4} />
                  </div>
                </div>
              </div>
              <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
                Hover the sheet to change the plate
              </p>
            </div>
          );
        })()}
      </div>

      {/* Compare tray — sticky bottom, capped at 4 */}
      {trayCars.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 flex min-h-[62px] flex-wrap items-center gap-5 border-t border-accent bg-bg-surface px-6 py-2.5 md:left-14 md:px-11 lg:left-[196px]">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-secondary max-md:hidden">
            Compare tray
          </span>
          <div className="flex flex-1 flex-wrap gap-2">
            {trayCars.map((c) => (
              <span
                key={c.id}
                className="flex items-center gap-2.5 border border-border-rule px-2.5 py-1.5"
              >
                <span className="font-mono text-[10px] text-accent">{c.gen}</span>
                <span className="text-[13px] font-medium text-text-primary max-md:hidden">
                  {c.name}
                </span>
                <button
                  onClick={() => remove(c.id)}
                  aria-label={`Remove ${c.name} from tray`}
                  className="cursor-pointer font-mono text-[11px] text-text-secondary transition-colors duration-100 hover:text-signal-red"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <span className="font-mono text-[10px] text-text-muted max-md:hidden">
            {trayCars.length >= MAX_COMPARE
              ? "Tray full"
              : `${MAX_COMPARE - trayCars.length} more`}
          </span>
          <PWButton onClick={() => navigate("/compare")}>
            Compare {trayCars.length} →
          </PWButton>
        </div>
      )}
    </div>
  );
}
