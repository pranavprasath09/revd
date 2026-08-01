export interface MarqueeStat {
  label: string;
  value: string;
}

/**
 * Letterbox marquee — the Pit Wall replacement for the full-bleed hero.
 * 268px tall, horizontal theme-derived scrim, scan line, and the generation
 * code as the headline: `A80` reads bigger than `Toyota Supra`.
 */
export default function Marquee({
  image,
  alt,
  kicker,
  kickerInfo,
  code,
  name,
  stats,
  tags,
  overlay,
  height = 268,
}: {
  image: string;
  alt: string;
  /** Kicker row — either a plain label or custom nodes (e.g. a breadcrumb). */
  kicker: React.ReactNode;
  /** Secondary info after the accent rule, e.g. "1993–2002 · 2JZ-GTE". */
  kickerInfo?: string;
  /** The generation code headline, e.g. "A80". */
  code: string;
  /** Full car name beside the code. */
  name: string;
  stats?: MarqueeStat[];
  tags?: string[];
  /** Controls rendered over the photo, bottom-right (e.g. a backdrop stepper). */
  overlay?: React.ReactNode;
  /** Letterbox height in px — 268 spec default; Home runs taller to show the car. */
  height?: number;
}) {
  return (
    <div
      className="relative overflow-hidden border-b border-border-alpha"
      style={{ height: `min(${height}px, 80vh)` }}
    >
      {/* Keyed on src so a backdrop change crossfades in fast */}
      <img
        key={image}
        src={image}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover grayscale-[0.35] contrast-[1.05]"
        style={{ objectPosition: "50% 42%", animation: "fade-in 250ms ease both" }}
      />
      {/* All three stops derive from the theme base — works on light palettes too */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, var(--color-bg-base) 0%, var(--color-scrim-mid) 45%, var(--color-scrim-end) 100%)",
        }}
      />
      <div className="anim-scan absolute inset-x-0 h-px bg-accent" />
      <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-11">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
          {kicker}
          <span className="h-px w-[46px] bg-accent" />
          {kickerInfo && <span className="text-text-secondary">{kickerInfo}</span>}
        </div>
        <div className="mt-2.5 flex flex-wrap items-baseline gap-x-5 gap-y-1">
          <span className="font-mono text-[56px] font-bold leading-[0.86] tracking-[-0.04em] text-text-primary md:text-[96px]">
            {code}
          </span>
          <span className="text-xl font-bold tracking-[-0.025em] text-text-secondary md:text-[30px]">
            {name}
          </span>
        </div>
        {stats && (
          <div className="mt-5 flex gap-6 md:gap-10">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-secondary">
                  {s.label}
                </div>
                <div className="mt-[3px] font-mono text-[15px] font-semibold text-text-primary md:text-lg">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        )}
        {tags && (
          <div className="mt-[18px] flex flex-wrap gap-2.5">
            {tags.map((t) => (
              <span
                key={t}
                className="border border-border-rule px-2.5 py-[5px] font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      {overlay && (
        <div className="absolute bottom-4 right-6 z-10 md:right-11">{overlay}</div>
      )}
    </div>
  );
}
