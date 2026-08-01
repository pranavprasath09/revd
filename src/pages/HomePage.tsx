import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import Marquee from "@/components/pitwall/Marquee";
import FilterBar from "@/components/pitwall/FilterBar";
import Sheet, {
  CarCell,
  PosCell,
  type SheetColumn,
} from "@/components/pitwall/Sheet";
import { useSheetSort } from "@/components/pitwall/useSheetSort";
import { ScoreCell } from "@/components/pitwall/ScoreBar";
import { SHEET_CARS, carPath, type SheetCar } from "@/lib/carData";

const CHIP_TAGS = ["All", "JDM", "European", "Muscle", "Exotic", "Legend"];

type SortKey = "pop" | "pw" | "zeroN" | "weight" | "rel";
const ASC_FIRST: SortKey[] = ["zeroN", "weight"];
const SORT_LABELS: Record<SortKey, string> = {
  pop: "popularity",
  pw: "power",
  zeroN: "0–100",
  weight: "mass",
  rel: "reliability",
};

// The marquee backdrop is the user's pick, persisted locally
const RECORD_KEY = "revd-record-car";
const BY_POP = SHEET_CARS.slice().sort((a, b) => b.pop - a.pop);

// Marquee height — draggable from the bottom edge, persisted locally
const HEIGHT_KEY = "revd-record-height";
const MIN_H = 268;
const MAX_H = 720;
const DEFAULT_H = 440;
const clampH = (h: number) => Math.min(MAX_H, Math.max(MIN_H, Math.round(h)));

export default function HomePage() {
  const navigate = useNavigate();
  const [tag, setTag] = useState("All");
  const sort = useSheetSort<SortKey>("pop", ASC_FIRST);

  // Car of record — the saved pick, defaulting to the most popular car on file
  const [recordIdx, setRecordIdx] = useState(() => {
    const saved = localStorage.getItem(RECORD_KEY);
    const idx = saved ? BY_POP.findIndex((c) => c.id === saved) : -1;
    return idx >= 0 ? idx : 0;
  });
  const record = BY_POP[recordIdx];

  const stepRecord = (delta: number) => {
    setRecordIdx((i) => {
      const next = (i + delta + BY_POP.length) % BY_POP.length;
      localStorage.setItem(RECORD_KEY, BY_POP[next].id);
      return next;
    });
  };

  // Marquee height — drag the bottom edge; saved on release
  const [marqueeH, setMarqueeH] = useState(() => {
    const saved = Number(localStorage.getItem(HEIGHT_KEY));
    return Number.isFinite(saved) && saved >= MIN_H && saved <= MAX_H
      ? saved
      : DEFAULT_H;
  });
  const drag = useRef<{ startY: number; startH: number } | null>(null);
  const liveH = useRef(marqueeH);

  const setHeight = (h: number, persist = false) => {
    const clamped = clampH(h);
    liveH.current = clamped;
    setMarqueeH(clamped);
    if (persist) localStorage.setItem(HEIGHT_KEY, String(clamped));
  };

  const onHandleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { startY: e.clientY, startH: liveH.current };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onHandleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setHeight(drag.current.startH + (e.clientY - drag.current.startY));
  };
  const onHandleUp = () => {
    if (!drag.current) return;
    drag.current = null;
    localStorage.setItem(HEIGHT_KEY, String(liveH.current));
  };
  const onHandleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") setHeight(liveH.current + 20, true);
    else if (e.key === "ArrowUp") setHeight(liveH.current - 20, true);
  };

  const rows = useMemo(() => {
    const filtered = SHEET_CARS.filter(
      (c) => tag === "All" || c.tags.includes(tag),
    );
    return sort.sortRows(filtered, (c, key) => c[key]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag, sort.sortKey, sort.sortDir]);

  const columns: SheetColumn<SheetCar>[] = [
    { key: "pos", label: "Pos", width: "44px", render: (_, i) => <PosCell index={i} /> },
    {
      key: "car",
      label: "Car",
      width: "1fr",
      render: (c) => <CarCell hero={c.hero} name={c.name} years={c.years} />,
    },
    {
      key: "gen",
      label: "Gen",
      width: "88px",
      optional: true,
      render: (c) => (
        <span className="font-mono text-xs font-semibold text-accent">{c.gen}</span>
      ),
    },
    {
      key: "pw",
      label: <>Power{sort.arrow("pw")}</>,
      width: "96px",
      sortable: true,
      optional: true,
      render: (c) => (
        <span className="font-mono text-[13px] text-text-primary">{c.power}</span>
      ),
    },
    {
      key: "zeroN",
      label: <>0–100{sort.arrow("zeroN")}</>,
      width: "92px",
      sortable: true,
      optional: true,
      render: (c) => (
        <span className="font-mono text-[13px] text-text-primary">{c.zero}</span>
      ),
    },
    {
      key: "weight",
      label: <>Mass{sort.arrow("weight")}</>,
      width: "92px",
      sortable: true,
      optional: true,
      render: (c) => (
        <span className="font-mono text-[13px] text-text-secondary">{c.weight}kg</span>
      ),
    },
    {
      key: "dt",
      label: "Drive",
      width: "88px",
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
      width: "118px",
      sortable: true,
      render: (c) => <ScoreCell score={c.rel} />,
    },
  ];

  return (
    <div className="page-enter pb-14">
      <SEOHead
        title="Dashboard"
        description="Every spec, every mod, every story. The home base for car culture."
        canonicalUrl="https://revhub.com/"
      />

      {record && (
        <div className="relative">
          <Marquee
            height={marqueeH}
            image={record.hero}
          alt={`${record.name} ${record.gen}`}
          kicker={<span>Car of record</span>}
          kickerInfo={`${record.years} · ${record.engine}`}
          code={record.gen}
          name={record.name}
          stats={[
            { label: "Power", value: record.power },
            { label: "0–100", value: record.zero },
            { label: "Mass", value: `${record.weight}kg` },
            { label: "Popularity", value: String(record.pop) },
          ]}
          overlay={
            <div className="flex items-center gap-2.5 border border-border-rule bg-bg-base/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em]">
              <span className="text-text-secondary max-md:hidden">Backdrop</span>
              <button
                onClick={() => stepRecord(-1)}
                aria-label="Previous car"
                className="cursor-pointer px-1.5 py-0.5 text-text-secondary transition-colors duration-100 hover:text-accent"
              >
                ‹
              </button>
              <span className="min-w-[52px] text-center text-text-primary">
                {String(recordIdx + 1).padStart(2, "0")} / {BY_POP.length}
              </span>
              <button
                onClick={() => stepRecord(1)}
                aria-label="Next car"
                className="cursor-pointer px-1.5 py-0.5 text-text-secondary transition-colors duration-100 hover:text-accent"
              >
                ›
              </button>
            </div>
          }
          />

          {/* Drag rail — resize the marquee from its bottom edge */}
          <div
            role="slider"
            aria-label="Marquee height — drag or use arrow keys"
            aria-valuemin={MIN_H}
            aria-valuemax={MAX_H}
            aria-valuenow={marqueeH}
            aria-orientation="vertical"
            tabIndex={0}
            onPointerDown={onHandleDown}
            onPointerMove={onHandleMove}
            onPointerUp={onHandleUp}
            onPointerCancel={onHandleUp}
            onKeyDown={onHandleKey}
            onDoubleClick={() => setHeight(DEFAULT_H, true)}
            title="Drag to resize · double-click to reset"
            className="group absolute inset-x-0 bottom-0 z-20 flex h-4 translate-y-1/2 cursor-ns-resize touch-none select-none items-center justify-center outline-none"
          >
            <span className="flex h-[9px] w-14 items-center justify-center border border-border-rule bg-bg-base transition-colors duration-100 group-hover:border-accent group-focus-visible:border-accent">
              <span className="h-px w-8 bg-text-muted transition-colors duration-100 group-hover:bg-accent group-focus-visible:bg-accent" />
            </span>
          </div>
        </div>
      )}

      <FilterBar
        options={CHIP_TAGS}
        value={tag}
        onChange={setTag}
        count={rows.length}
        sortLabel={SORT_LABELS[sort.sortKey]}
      />

      <div className="px-6 md:px-11">
        <Sheet
          columns={columns}
          rows={rows}
          rowKey={(c) => c.id}
          onSort={(key) => sort.toggle(key as SortKey)}
          onRowClick={(c) => navigate(carPath(c.car))}
        />
      </div>
    </div>
  );
}
