/**
 * Margin section heading — serif title, a flex hairline rule, and a
 * right-hand mono note ("Every car on file", "Click to enlarge").
 */
export default function SectionRule({
  title,
  note,
  size = 34,
}: {
  title: string;
  note?: string;
  size?: number;
}) {
  return (
    <div className="flex items-baseline gap-[18px]">
      <h2
      className="font-editorial font-normal tracking-[-0.01em] text-text-primary"
        style={{ fontSize: size }}
      >
        {title}
      </h2>
      <span className="h-px flex-1 bg-border-rule" />
      {note && (
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted max-md:hidden">
          {note}
        </span>
      )}
    </div>
  );
}

/** Serif italic pull quote at print scale. */
export function PullQuote({
  children,
  attribution,
  size = 30,
}: {
  children: React.ReactNode;
  attribution?: string;
  size?: number;
}) {
  return (
    <figure className="m-0">
      <blockquote
        className="m-0 font-editorial italic leading-[1.22] text-text-primary"
        style={{ fontSize: size }}
      >
        {children}
      </blockquote>
      {attribution && (
        <figcaption className="mt-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary">
          {attribution}
        </figcaption>
      )}
    </figure>
  );
}
