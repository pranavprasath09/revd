import { reliabilityColor } from "@/lib/themes";

/**
 * Data-driven score bar — elevated track filled to score%.
 * >= 80 green, 65–79 accent, < 65 red, in both formats.
 */
export default function ScoreBar({
  score,
  width = 56,
  height = 3,
  flex = false,
}: {
  score: number;
  width?: number;
  height?: number;
  /** Fill the available track instead of a fixed width. */
  flex?: boolean;
}) {
  return (
    <span
      className={`relative inline-block bg-bg-elevated ${flex ? "w-full" : ""}`}
      style={{ width: flex ? undefined : width, height }}
      role="img"
      aria-label={`Score ${score} out of 100`}
    >
      <span
        className="absolute inset-y-0 left-0"
        style={{ width: `${score}%`, background: reliabilityColor(score) }}
      />
    </span>
  );
}

/** Score bar with the numeric score beside it, as the sheets render it. */
export function ScoreCell({
  score,
  width = 56,
  height = 3,
  flex = false,
  emphasize = false,
}: {
  score: number;
  width?: number;
  height?: number;
  flex?: boolean;
  /** Larger, score-colored numeral (reliability index page). */
  emphasize?: boolean;
}) {
  return (
    <span className={`flex items-center gap-2 ${flex ? "pr-7" : ""}`}>
      <ScoreBar score={score} width={width} height={height} flex={flex} />
      <span
        className={
          emphasize
            ? "font-mono text-sm font-semibold"
            : "font-mono text-[11px] text-text-secondary"
        }
        style={emphasize ? { color: reliabilityColor(score) } : undefined}
      >
        {score}
      </span>
    </span>
  );
}
