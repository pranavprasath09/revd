import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "quiet";

const VARIANT_CLASSES: Record<Variant, string> = {
  // Accent fill, base-colored text
  primary:
    "border border-accent bg-accent text-bg-base px-5 py-[11px] hover:bg-accent-hover hover:border-accent-hover",
  // Accent outline
  secondary:
    "border border-accent bg-transparent text-accent px-[18px] py-[9px] hover:bg-accent-dim",
  // Hairline outline, secondary text
  quiet:
    "border border-border-rule bg-transparent text-text-secondary px-[18px] py-[9px] hover:border-accent hover:text-accent",
};

/** Pit Wall button — no radius, ever. Mono 10px uppercase. */
export default function PWButton({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`cursor-pointer font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}

/**
 * Quiet toggle — inverts to an accent fill with base text when on.
 * The RSVP / join / follow pattern in both formats.
 */
export function ToggleButton({
  on,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { on: boolean }) {
  return (
    <button
      aria-pressed={on}
      className={`cursor-pointer border px-3.5 py-[7px] font-mono text-[10px] uppercase tracking-[0.14em] transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-50
        ${
          on
            ? "border-accent bg-accent text-bg-base"
            : "border-border-alpha bg-transparent text-text-secondary hover:border-accent hover:text-accent"
        } ${className}`}
      {...props}
    />
  );
}

/**
 * Vote cluster — bordered ▲ / score / ▼ group. Up and down are mutually
 * exclusive and re-clickable to zero; score reflects the delta live.
 */
export function VoteCluster({
  score,
  delta,
  onUp,
  onDown,
  compact = false,
  vertical = false,
}: {
  score: number;
  /** The current user's vote: 1, -1 or 0. */
  delta: number;
  onUp: () => void;
  onDown: () => void;
  compact?: boolean;
  vertical?: boolean;
}) {
  const upColor = delta > 0 ? "text-accent" : "text-text-muted";
  const downColor = delta < 0 ? "text-signal-red" : "text-text-muted";
  const pad = compact ? "px-[7px] py-[5px]" : "px-2 py-1.5";

  if (vertical) {
    return (
      <span className="flex shrink-0 flex-col items-center gap-1 border border-border-rule px-1 py-1.5">
        <button
          onClick={onUp}
          aria-label="Upvote"
          className={`cursor-pointer px-2 py-0.5 text-xs transition-colors duration-100 hover:text-accent ${upColor}`}
        >
          ▲
        </button>
        <span className="font-mono text-sm font-semibold text-text-primary">{score}</span>
        <button
          onClick={onDown}
          aria-label="Downvote"
          className={`cursor-pointer px-2 py-0.5 text-xs transition-colors duration-100 hover:text-signal-red ${downColor}`}
        >
          ▼
        </button>
      </span>
    );
  }

  return (
    <span className="flex w-max items-center gap-2 border border-border-rule">
      <button
        onClick={onUp}
        aria-label="Upvote"
        className={`cursor-pointer font-mono ${compact ? "text-[10px]" : "text-[11px]"} transition-colors duration-100 hover:text-accent ${pad} ${upColor}`}
      >
        ▲
      </button>
      <span className="min-w-6 text-center font-mono text-xs font-semibold text-text-primary">
        {score}
      </span>
      <button
        onClick={onDown}
        aria-label="Downvote"
        className={`cursor-pointer font-mono ${compact ? "text-[10px]" : "text-[11px]"} transition-colors duration-100 hover:text-signal-red ${pad} ${downColor}`}
      >
        ▼
      </button>
    </span>
  );
}
