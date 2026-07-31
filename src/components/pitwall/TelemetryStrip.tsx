export interface TelemetryCell {
  label: string;
  value: string;
}

/**
 * Pit Wall telemetry strip — 56px, hairline-bottomed, with the accent sweep
 * line crossing its top edge and a live dot at the right end.
 */
export default function TelemetryStrip({
  cells,
  live = true,
  cellMinWidth = 132,
}: {
  cells: TelemetryCell[];
  live?: boolean;
  cellMinWidth?: number;
}) {
  return (
    <div className="relative flex h-14 shrink-0 items-stretch overflow-hidden border-b border-border-alpha">
      <div className="anim-sweep absolute left-0 top-0 h-px w-1/4 bg-accent" />
      {cells.map((c) => (
        <div
          key={c.label}
          className="flex flex-col justify-center gap-0.5 border-r border-border-alpha px-[22px]"
          style={{ minWidth: cellMinWidth }}
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-secondary">
            {c.label}
          </span>
          <span className="font-mono text-[15px] font-semibold text-text-primary">
            {c.value}
          </span>
        </div>
      ))}
      {live && (
        <div className="flex flex-1 items-center justify-end gap-2.5 px-[22px]">
          <span className="anim-pulse h-1.5 w-1.5 rounded-full bg-signal-green" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
            Live
          </span>
        </div>
      )}
    </div>
  );
}
