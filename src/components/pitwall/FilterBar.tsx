/** Pit Wall filter chip — no radius, single-select, accent fill when active. */
export function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors duration-100
        ${
          active
            ? "border border-accent bg-accent text-bg-base"
            : "border border-border-rule bg-transparent text-text-secondary hover:border-accent"
        }`}
    >
      {label}
    </button>
  );
}

/** A labelled row of chips. */
export function ChipRow({
  label,
  options,
  value,
  onChange,
  labelWidth,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  labelWidth?: number;
}) {
  return (
    <div className="flex items-center gap-5">
      <span
        className="shrink-0 font-mono text-[9px] uppercase tracking-[0.24em] text-text-muted"
        style={labelWidth ? { width: labelWidth } : undefined}
      >
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <Chip key={o} label={o} active={value === o} onClick={() => onChange(o)} />
        ))}
      </div>
    </div>
  );
}

/**
 * Filter bar — label, chips, and a right-aligned mono count reading
 * "N entries · sorted by [key]".
 */
export default function FilterBar({
  label = "Filter",
  options,
  value,
  onChange,
  count,
  sortLabel,
}: {
  label?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  count?: number;
  sortLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-5 border-b border-border-alpha px-6 py-[18px] md:px-11">
      <ChipRow label={label} options={options} value={value} onChange={onChange} />
      {(count !== undefined || sortLabel) && (
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
          {count !== undefined && `${count} entries`}
          {count !== undefined && sortLabel && " · "}
          {sortLabel && `sorted by ${sortLabel}`}
        </span>
      )}
    </div>
  );
}
