import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import useSubscription from "@/hooks/useSubscription";
import PageHeader from "@/components/pitwall/PageHeader";
import PWButton from "@/components/pitwall/Button";

type SpecRow =
  | { group: string }
  | { label: string; free: string | boolean; pro: string | boolean };

/** The plan as a spec sheet — rows are features, columns are tiers. */
const SPEC_ROWS: SpecRow[] = [
  { group: "Access" },
  { label: "Car database, all 39 profiles", free: true, pro: true },
  { label: "Reliability scores and fault ledgers", free: true, pro: true },
  { label: "Fault costs and mileage on Pro reports", free: false, pro: true },
  { label: "Mod guide part numbers and install notes", free: "Free guides", pro: "All guides" },
  { group: "Community" },
  { label: "Join public departments", free: true, pro: true },
  { label: "Premium departments", free: false, pro: true },
  { label: "PRO badge on profile and posts", free: false, pro: true },
  { label: "Priority search placement", free: false, pro: true },
  { group: "Platform" },
  { label: "Garage, builds, albums and meets", free: true, pro: true },
  { label: "Early access to new features", free: false, pro: true },
];

function cell(value: string | boolean): {
  text: string;
  className: string;
} {
  if (value === true) return { text: "✓", className: "text-accent" };
  if (value === false) return { text: "—", className: "text-text-muted" };
  return { text: value, className: "text-text-secondary" };
}

export default function PremiumPage() {
  const { user, loading: authLoading } = useAuthContext();
  const { isPremium, status, currentPeriodEnd, subscribe, manageSubscription, loading } =
    useSubscription();
  const [searchParams] = useSearchParams();
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";

  async function handleSubscribe() {
    setActionLoading(true);
    setError("");
    const result = await subscribe();
    if (result.error) {
      setError(result.error);
      setActionLoading(false);
    }
    // On success the user is redirected to Stripe
  }

  async function handleManage() {
    setActionLoading(true);
    setError("");
    const result = await manageSubscription();
    if (result.error) {
      setError(result.error);
      setActionLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="page-enter px-6 py-[34px] md:px-11">
        <div className="h-12 w-1/3 animate-pulse bg-bg-surface" />
        <div className="mt-6 h-64 animate-pulse bg-bg-surface" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-enter">
        <SEOHead title="Premium" description="Upgrade to RevD PRO for exclusive features." />
        <PageHeader kicker="Membership" title="PREMIUM" />
        <div className="px-6 md:px-11">
          <p className="max-w-[460px] text-sm leading-relaxed text-text-secondary">
            A spec sheet, not a pricing page. Sign in to see the comparison and
            go Pro.
          </p>
          <div className="mt-6">
            <Link to="/sign-in?redirect=/premium">
              <PWButton>Sign in</PWButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter pb-[72px]">
      <SEOHead
        title="Premium"
        description="Upgrade to RevD PRO — PRO badge, priority placement, exclusive communities, and early access to new features."
      />

      <PageHeader
        kicker="Membership"
        title="PREMIUM"
        support="A spec sheet, not a pricing page. Everything Free does, Pro does without a ceiling."
      />

      <div className="max-w-[1000px] px-6 md:px-11">
        {/* Status lines */}
        {success && (
          <p className="mb-5 border border-signal-green px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-signal-green">
            Welcome to PRO — your subscription is active
          </p>
        )}
        {canceled && (
          <p className="mb-5 border border-border-rule px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-text-secondary">
            Checkout canceled · no charges were made
          </p>
        )}
        {error && (
          <p className="mb-5 border border-signal-red px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-signal-red">
            {error}
          </p>
        )}
        {isPremium && (
          <div className="mb-5 flex flex-wrap items-center gap-5 border border-accent px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              PRO · {status === "active" ? "Active" : status}
            </span>
            {currentPeriodEnd && (
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary">
                Renews{" "}
                {new Date(currentPeriodEnd).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            <span className="flex-1" />
            <button
              onClick={handleManage}
              disabled={actionLoading}
              className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary transition-colors duration-100 hover:text-accent disabled:opacity-50"
            >
              {actionLoading ? "Loading…" : "Manage subscription"}
            </button>
          </div>
        )}

        {/* Tier heads */}
        <div className="grid grid-cols-[1fr_96px_112px] items-end border-b border-accent pb-3.5 md:grid-cols-[1fr_172px_172px]">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary">
            Feature
          </span>
          <span className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary">
              Free
            </span>
            <span className="font-mono text-[34px] font-bold leading-none tracking-[-0.03em] text-text-primary">
              $0
            </span>
          </span>
          <span className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent">
              Pro
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="font-mono text-[34px] font-bold leading-none tracking-[-0.035em] text-accent md:text-[46px]">
                $9.99
              </span>
              <span className="font-mono text-[11px] text-text-secondary">/mo</span>
            </span>
          </span>
        </div>

        {/* Feature rows */}
        {SPEC_ROWS.map((row) =>
          "group" in row ? (
            <div
              key={row.group}
              className="border-t border-accent pb-2 pt-[26px] font-mono text-[9px] uppercase tracking-[0.24em] text-accent first:border-t-0"
            >
              {row.group}
            </div>
          ) : (
            <div
              key={row.label}
              className="grid h-[42px] grid-cols-[1fr_96px_112px] items-center border-b border-border-hair transition-colors duration-100 hover:bg-bg-elevated md:grid-cols-[1fr_172px_172px]"
            >
              <span className="pr-4 text-sm text-text-primary">{row.label}</span>
              <span className={`font-mono text-[13px] ${cell(row.free).className}`}>
                {cell(row.free).text}
              </span>
              <span
                className={`font-mono text-[13px] font-semibold ${cell(row.pro).className}`}
              >
                {cell(row.pro).text}
              </span>
            </div>
          ),
        )}

        {/* Actions under each column */}
        {!loading && (
          <div className="grid grid-cols-[1fr_96px_112px] pt-6 md:grid-cols-[1fr_172px_172px]">
            <span />
            <span className="pr-3 md:pr-5">
              <PWButton variant="quiet" className="w-full" disabled>
                {isPremium ? "Included" : "Current plan"}
              </PWButton>
            </span>
            <span className="pr-0 md:pr-5">
              {isPremium ? (
                <PWButton
                  variant="secondary"
                  className="w-full"
                  onClick={handleManage}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Loading…" : "Manage"}
                </PWButton>
              ) : (
                <PWButton
                  className="w-full"
                  onClick={handleSubscribe}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Redirecting…" : "Go Pro"}
                </PWButton>
              )}
            </span>
          </div>
        )}
        {loading && <div className="mt-6 h-12 animate-pulse bg-bg-surface" />}

        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
          Cancel anytime · no commitment
        </p>
      </div>
    </div>
  );
}
