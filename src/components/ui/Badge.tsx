import type { ReactNode } from "react";

type BadgeVariant = "difficulty" | "tag" | "premium";

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  advanced: "bg-red-500/15 text-red-400 border-red-500/25",
};

function getDifficultyClasses(label: string): string {
  const key = label.toString().toLowerCase().trim();
  return difficultyColors[key] ?? difficultyColors.beginner;
}

const variantStyles: Record<BadgeVariant, string> = {
  difficulty: "border",
  tag: "bg-bg-surface border border-border text-text-secondary",
  premium: "bg-accent-red/15 text-accent-red border border-accent-red/25",
};

export default function Badge({ variant, children, className = "" }: BadgeProps) {
  const base =
    "font-body inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold leading-none whitespace-nowrap";

  const variantClass =
    variant === "difficulty"
      ? getDifficultyClasses(typeof children === "string" ? children : "")
      : variantStyles[variant];

  return (
    <span className={`${base} ${variantClass} ${className}`}>
      {variant === "premium" && (
        <svg
          className="mr-1 h-3 w-3"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 1l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 11.8 3.8 14l.8-4.7L1.2 6l4.7-.7L8 1z" />
        </svg>
      )}
      {children}
    </span>
  );
}
