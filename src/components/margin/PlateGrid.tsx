import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export interface Plate {
  key: string;
  image: string;
  /** Grid columns to span at desktop: 2, 3, 4 or 6. */
  span: 2 | 3 | 4 | 6;
  /** CSS aspect-ratio, e.g. "3 / 2". The varying shapes are the design. */
  ratio: string;
  num: string;
  title: string;
  byline?: string;
  /** Optional navigation target for the caption; the image opens the lightbox. */
  to?: string;
}

const LG_SPAN: Record<Plate["span"], string> = {
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  6: "lg:col-span-6",
};

/**
 * The plates — a deliberately irregular 6-column grid. Each plate declares
 * its own span and aspect ratio; never a uniform grid. Falls to 2 columns
 * below lg while keeping the varied ratios.
 */
export default function PlateGrid({
  plates,
  captionStyle = "title",
  onOpen,
}: {
  plates: Plate[];
  /** "title": serif 19px title + italic byline. "italic": italic 15px caption only. */
  captionStyle?: "title" | "italic";
  /** Called when a plate is clicked; when omitted the built-in lightbox opens. */
  onOpen?: (index: number) => void;
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const open = onOpen ?? ((i: number) => setLightbox(i));

  return (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-[22px] lg:grid-cols-6">
        {plates.map((p, i) => {
          const title =
            captionStyle === "title" ? (
              <span className="font-editorial text-[19px] leading-[1.2] text-text-primary transition-colors duration-150 hover:text-accent">
                {p.title}
              </span>
            ) : (
              <span className="font-editorial text-[15px] italic text-text-secondary transition-colors duration-150 hover:text-accent">
                {p.title}
              </span>
            );
          return (
            <div
              key={p.key}
              className={`${p.span >= 3 ? "col-span-2" : "col-span-1"} ${LG_SPAN[p.span]}`}
            >
              <button
                onClick={() => open(i)}
                className="group block w-full cursor-pointer border-0 bg-transparent p-0"
                aria-label={`Enlarge ${p.title}`}
              >
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  className="block w-full object-cover transition-opacity duration-200 group-hover:opacity-75"
                  style={{ aspectRatio: p.ratio }}
                />
              </button>
              <span className="mt-2.5 flex items-baseline gap-2.5">
                <span className="font-mono text-[9px] text-accent">{p.num}</span>
                {p.to ? <Link to={p.to}>{title}</Link> : title}
              </span>
              {captionStyle === "title" && p.byline && (
                <span className="mt-1 block font-editorial text-[13px] italic text-text-secondary">
                  {p.byline}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {lightbox !== null && plates[lightbox] && (
        <Lightbox
          plates={plates}
          index={lightbox}
          onNavigate={setLightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}

/**
 * Full-frame lightbox — click anywhere closes, Escape closes, ←/→ page,
 * focus is trapped on the dialog and returned on close.
 */
export function Lightbox({
  plates,
  index,
  onNavigate,
  onClose,
}: {
  plates: Plate[];
  index: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}) {
  const plate = plates[index];
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const step = useCallback(
    (delta: number) => {
      onNavigate((index + delta + plates.length) % plates.length);
    },
    [index, plates.length, onNavigate],
  );

  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => restoreRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "Tab") {
        // Single-stop focus trap — the dialog is the only tabbable element
        e.preventDefault();
        dialogRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, step]);

  if (!plate) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={plate.title}
      tabIndex={-1}
      onClick={onClose}
      className="animate-fade-in fixed inset-0 z-[60] flex cursor-pointer flex-col items-center justify-center gap-[22px] p-6 outline-none md:p-14"
      style={{ background: "rgba(6,6,8,0.94)", animationDuration: "0.2s" }}
    >
      <img
        src={plate.image}
        alt={plate.title}
        className="block max-h-[660px] max-w-full object-contain"
      />
      <div className="flex flex-wrap items-baseline justify-center gap-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
          Plate {plate.num}
        </span>
        <span className="font-editorial text-[28px] text-[#E8E8ED]">{plate.title}</span>
        {plate.byline && (
          <span className="font-editorial text-[15px] italic text-[#6B6F76]">
            {plate.byline}
          </span>
        )}
      </div>
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#6B6F76]">
        Click anywhere to close · ← → to page
      </span>
    </div>
  );
}
