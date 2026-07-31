import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Retained-image plate — swaps `src` on the same element and restarts a
 * 400ms fade. Never remounts, and always has a real initial src so the
 * first paint is not empty.
 */
export function PlateImage({
  src,
  alt,
  aspect = "4 / 3",
  durationMs = 400,
}: {
  src: string;
  alt: string;
  aspect?: string;
  /** Crossfade length — 400ms editorial default, shorter for instrument panels. */
  durationMs?: number;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const initial = useRef(src);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.getAttribute("src") === src) return;
    el.style.animation = "none";
    el.setAttribute("src", src);
    void el.offsetWidth;
    el.style.animation = `fade-in ${durationMs}ms ease both`;
  }, [src, durationMs]);

  return (
    <div
      className="relative overflow-hidden bg-bg-surface"
      style={{ aspectRatio: aspect }}
    >
      <img
        ref={ref}
        src={initial.current}
        alt={alt}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

/** Serif row name — accent + underline wipe on row hover. */
export function IdxName({
  children,
  size = 25,
}: {
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <span
      className="font-editorial leading-[1.1] text-text-primary transition-colors duration-150 group-hover:text-accent group-focus-visible:text-accent"
      style={{ fontSize: size }}
    >
      {children}
    </span>
  );
}

export function IdxNum({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[10px] text-text-muted">{children}</span>;
}

export function IdxAccent({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[11px] text-accent">{children}</span>;
}

export function IdxMuted({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[10px] text-text-muted">{children}</span>;
}

export function IdxMono({
  children,
  right = false,
}: {
  children: React.ReactNode;
  right?: boolean;
}) {
  return (
    <span
      className={`font-mono text-[11px] text-text-secondary ${right ? "pr-1 text-right" : ""}`}
    >
      {children}
    </span>
  );
}

export interface IndexListItem {
  key: string;
  /** Plate image shown in the sticky panel while this row is hovered. */
  image: string;
  /** Navigation target — rows navigate on click (and are links for a11y). */
  to?: string;
}

/**
 * The index — Margin's answer to a card grid. Hairline rows whose hover
 * wipes an accent underline in from the left and swaps the sticky plate
 * on the right with a 400ms fade. Below lg the panel drops and rows
 * simply navigate.
 */
export default function IndexList<T extends IndexListItem>({
  items,
  gridTemplate,
  renderCells,
  renderPanel,
  hint,
  rowPadding = 13,
}: {
  items: T[];
  /** Shared grid template for every row, e.g. "46px 1fr 74px 116px 74px". */
  gridTemplate: string;
  renderCells: (item: T, index: number) => React.ReactNode;
  /** Caption block under the plate image for the active item. */
  renderPanel: (item: T, index: number) => React.ReactNode;
  hint?: string;
  rowPadding?: number;
}) {
  const [active, setActive] = useState(0);
  const activeItem = items[Math.min(active, items.length - 1)];

  return (
    <div className="grid items-start lg:grid-cols-[1fr_452px]">
      <div>
        {items.map((item, i) => {
          const cells = renderCells(item, i);
          const rowClass =
            "group relative grid items-baseline border-b border-border-hair cursor-pointer";
          const style = {
            gridTemplateColumns: gridTemplate,
            padding: `${rowPadding}px 0`,
          };
          const underline = (
            <span className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-accent transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
          );
          const activate = () => setActive(i);
          return item.to ? (
            <Link
              key={item.key}
              to={item.to}
              className={rowClass}
              style={style}
              onMouseEnter={activate}
              onFocus={activate}
            >
              {cells}
              {underline}
            </Link>
          ) : (
            <div
              key={item.key}
              tabIndex={0}
              className={rowClass}
              style={style}
              onMouseEnter={activate}
              onFocus={activate}
            >
              {cells}
              {underline}
            </div>
          );
        })}
      </div>

      {activeItem && (
        <div className="sticky top-0 pb-16 pl-10 pt-12 max-lg:hidden">
          <div className="border border-border-alpha">
            <PlateImage src={activeItem.image} alt="" />
            <div className="px-[22px] pb-[22px] pt-5">
              {renderPanel(activeItem, active)}
            </div>
          </div>
          {hint && (
            <p className="mt-3.5 font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
              {hint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
