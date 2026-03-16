import type { ReactNode } from "react";
import Button from "@/components/ui/Button";

interface PremiumGateProps {
  feature: string;
  children: ReactNode;
}

export default function PremiumGate({ feature, children }: PremiumGateProps) {
  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Blurred content */}
      <div className="pointer-events-none select-none blur-sm">{children}</div>

      {/* Glass overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-bg-base/60 backdrop-blur-md">
        <div className="mx-4 flex max-w-sm flex-col items-center rounded-2xl border border-border/60 bg-bg-surface/80 px-8 py-10 text-center shadow-2xl shadow-black/40 backdrop-blur-xl">
          {/* Lock icon */}
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-red/10">
            <svg
              className="h-7 w-7 text-accent-red"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h3 className="font-display mb-2 text-lg uppercase tracking-wide text-text-primary">
            Unlock {feature}
          </h3>

          <p className="font-body mb-6 text-sm leading-relaxed text-text-secondary">
            Get full access for{" "}
            <span className="font-mono font-semibold text-text-primary">$6/mo</span> or{" "}
            <span className="font-mono font-semibold text-text-primary">$50/year</span>
          </p>

          <Button variant="primary" size="md" className="w-full">
            Upgrade to Premium
          </Button>

          <p className="font-body mt-3 text-[11px] text-text-muted">
            Cancel anytime. 7-day free trial.
          </p>
        </div>
      </div>
    </div>
  );
}
