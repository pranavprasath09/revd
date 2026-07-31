export interface StatCell {
  label: string;
  value: string;
  /** Optional CSS color, e.g. "var(--color-accent)". Defaults to primary text. */
  color?: string;
}

/** Bordered stat cluster — cells with left borders, label over mono value. */
export function StatCluster({
  stats,
  size = 22,
}: {
  stats: StatCell[];
  size?: 20 | 22;
}) {
  return (
    <div className="flex items-stretch border border-border-alpha">
      {stats.map((s) => (
        <div
          key={s.label}
          className="border-l border-border-alpha px-4 py-3 first:border-l-0 md:px-[22px]"
        >
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary">
            {s.label}
          </div>
          <div
            className="mt-0.5 font-mono font-semibold"
            style={{ fontSize: size, color: s.color ?? "var(--color-text-primary)" }}
          >
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Mono breadcrumb row used above Pit Wall page titles. */
export function Breadcrumb({ parts }: { parts: { label: string; accent?: boolean }[] }) {
  return (
    <div className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary">
      {parts.map((p, i) => (
        <span key={`${p.label}-${i}`} className="flex items-center gap-2.5">
          {i > 0 && <span className="text-text-muted">/</span>}
          <span className={p.accent ? "text-accent" : undefined}>{p.label}</span>
        </span>
      ))}
    </div>
  );
}

/**
 * Pit Wall page header — kicker over a mono display title. The mono display
 * face is what makes these pages feel like instruments rather than documents.
 */
export default function PageHeader({
  kicker,
  kickerColor,
  title,
  support,
  right,
  breadcrumb,
  titleSize = 46,
}: {
  kicker?: string;
  /** CSS color override for the kicker (e.g. signal red on the 404). */
  kickerColor?: string;
  title: string;
  support?: React.ReactNode;
  /** Right side — a StatCluster or a primary action. */
  right?: React.ReactNode;
  breadcrumb?: { label: string; accent?: boolean }[];
  titleSize?: 38 | 44 | 46;
}) {
  return (
    <div className="flex flex-col gap-5 px-6 pb-[22px] pt-[34px] md:flex-row md:items-end md:justify-between md:px-11">
      <div className="min-w-0">
        {breadcrumb && <Breadcrumb parts={breadcrumb} />}
        {kicker && (
          <div
            className="font-mono text-[9px] uppercase tracking-[0.24em] text-accent"
            style={kickerColor ? { color: kickerColor } : undefined}
          >
            {kicker}
          </div>
        )}
        <h1
          className="mt-2 font-mono font-bold uppercase leading-none tracking-[-0.035em] text-text-primary"
          style={{ fontSize: `clamp(28px, 5vw, ${titleSize}px)` }}
        >
          {title}
        </h1>
        {support && (
          <p className="mt-3 max-w-[560px] text-sm leading-relaxed text-text-secondary">
            {support}
          </p>
        )}
      </div>
      {right && <div className="flex shrink-0 items-center gap-3.5">{right}</div>}
    </div>
  );
}
