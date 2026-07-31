/**
 * Folio stats — a four-column band. Serif numeral in accent, baseline-aligned
 * beside a cramped mono label that wraps to two lines. That contrast is the point.
 */
export default function FolioStats({
  stats,
}: {
  stats: { value: string; label: string }[];
}) {
  return (
    <div className="grid grid-cols-2 border-b border-border-alpha md:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex items-baseline gap-3.5 border-l border-border-hair px-6 py-6 first:border-l-0 md:px-8 md:py-[34px]"
        >
          <span className="font-editorial text-[34px] leading-none text-accent md:text-[46px]">
            {s.value}
          </span>
          <span className="max-w-[88px] font-mono text-[9px] uppercase leading-[1.5] tracking-[0.2em] text-text-muted">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
