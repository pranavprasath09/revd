/** Central loaders for the reliability reports and mod guides in src/data. */

export interface ReliabilityIssue {
  id: string;
  name: string;
  description: string;
  severity: string;
  isPremium: boolean;
  fixCostEstimate?: string;
  mileageRange?: string;
}

export interface ReliabilityData {
  carId: string;
  make: string;
  model: string;
  generation: string;
  overallScore: number;
  summary: string;
  issues: ReliabilityIssue[];
  buyingTips: string[];
}

export interface ModGuideEntry {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  costEstimate: string;
  isPremium: boolean;
  partNumbers?: string;
  installNotes?: string;
}

export interface ModData {
  carId: string;
  make: string;
  model: string;
  generation: string;
  mods: ModGuideEntry[];
}

const reliabilityFiles = import.meta.glob("@/data/reliability/*.json", {
  eager: true,
  import: "default",
}) as Record<string, ReliabilityData>;

const modFiles = import.meta.glob("@/data/mods/*.json", {
  eager: true,
  import: "default",
}) as Record<string, ModData>;

/** carId/slug → reliability report. */
export const RELIABILITY = new Map<string, ReliabilityData>(
  Object.values(reliabilityFiles).map((d) => [d.carId, d]),
);

/** carId/slug → mod guide. */
export const MOD_GUIDES = new Map<string, ModData>(
  Object.values(modFiles).map((d) => [d.carId, d]),
);

/** Difficulty word → 1–5 for the five-segment bar. */
export function difficultyLevel(difficulty: string): number {
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return 2;
    case "intermediate":
      return 3;
    case "advanced":
      return 4;
    case "expert":
      return 5;
    default:
      return 1;
  }
}

/** Five-segment difficulty bar — ▪▪▪▫▫, not stars. */
export function difficultyBar(level: number): string {
  return "▪".repeat(level) + "▫".repeat(Math.max(0, 5 - level));
}

/** Severity → CSS color. High red, Medium accent, Low secondary. */
export function severityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case "high":
      return "var(--color-signal-red)";
    case "medium":
      return "var(--color-accent)";
    default:
      return "var(--color-text-secondary)";
  }
}
