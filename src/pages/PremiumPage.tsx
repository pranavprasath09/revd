import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";
import useSubscription from "@/hooks/useSubscription";

const FEATURES = [
  {
    title: "PRO Badge",
    description: "Stand out with a PRO badge on your profile and in every community you post in.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    ),
  },
  {
    title: "Priority Search Placement",
    description: "Your builds, photos, and profile get boosted in search results and discovery pages.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    title: "Exclusive Communities",
    description: "Access PRO-only communities where serious enthusiasts share builds and knowledge.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    title: "Early Access",
    description: "Be the first to try new features before they launch to everyone else.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
  },
];

export default function PremiumPage() {
  const { user } = useAuthContext();
  const { isPremium, plan, status, currentPeriodEnd, subscribe, manageSubscription, loading } =
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
    // If successful, user is redirected — no need to setActionLoading(false)
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

  // Auth gate
  if (!user) {
    return (
      <div className="page-enter">
        <SEOHead title="Premium" description="Upgrade to RevD PRO for exclusive features." />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent-red/10 border border-accent-red/20">
            <svg className="h-10 w-10 text-accent-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
          </div>
          <h2 className="font-display text-2xl uppercase tracking-wide text-text-primary mb-2">
            Sign In Required
          </h2>
          <p className="font-body text-sm text-text-secondary max-w-md mb-6">
            Sign in to upgrade to RevD PRO.
          </p>
          <Link
            to="/sign-in?redirect=/premium"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <SEOHead
        title="Premium"
        description="Upgrade to RevD PRO — PRO badge, priority placement, exclusive communities, and early access to new features."
      />

      {/* Hero */}
      <div className="border-b border-border bg-bg-surface/50">
        <PageWrapper>
          <div className="py-10 sm:py-14 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-red/10 border border-accent-red/20">
              <svg className="h-8 w-8 text-accent-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
            </div>
            <p className="font-body text-[11px] font-bold uppercase tracking-widest text-accent-red mb-3">
              RevD PRO
            </p>
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-text-primary leading-none">
              Go Premium
            </h1>
            <p className="font-body mt-3 mx-auto max-w-xl text-base text-text-secondary leading-relaxed">
              Support the platform and unlock exclusive features that make your RevD experience even better.
            </p>
          </div>
        </PageWrapper>
      </div>

      <PageWrapper>
        <div className="max-w-2xl mx-auto py-8 space-y-8">
          {/* Success / Canceled banners */}
          {success && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-6 py-4 text-center">
              <p className="font-display text-lg uppercase tracking-wide text-green-400">
                Welcome to PRO!
              </p>
              <p className="mt-1 font-body text-sm text-green-400/80">
                Your subscription is now active. Enjoy your new features!
              </p>
            </div>
          )}

          {canceled && (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-6 py-4 text-center">
              <p className="font-body text-sm text-yellow-400">
                Checkout was canceled. No charges were made.
              </p>
            </div>
          )}

          {/* Current plan status (for premium users) */}
          {isPremium && (
            <div className="rounded-xl border border-accent-red/20 bg-accent-red/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-accent-red/20 px-3 py-1 font-body text-xs font-bold uppercase tracking-wider text-accent-red">
                      PRO
                    </span>
                    <span className="font-body text-sm text-text-secondary capitalize">
                      {status === "active" ? "Active" : status}
                    </span>
                  </div>
                  {currentPeriodEnd && (
                    <p className="mt-2 font-body text-sm text-text-muted">
                      Next billing date:{" "}
                      <span className="text-text-secondary">
                        {new Date(currentPeriodEnd).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                  )}
                </div>
                <button
                  onClick={handleManage}
                  disabled={actionLoading}
                  className="rounded-lg border border-white/10 bg-bg-surface px-5 py-2.5 font-body text-sm font-bold text-text-primary transition-colors hover:border-accent-red/30 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? "Loading..." : "Manage Subscription"}
                </button>
              </div>
            </div>
          )}

          {/* Features grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-white/10 bg-bg-surface p-5 transition-all hover:border-accent-red/20"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-red/10 text-accent-red">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-base uppercase tracking-wide text-text-primary">
                      {feature.title}
                    </h3>
                    <p className="mt-1 font-body text-sm text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing card (for non-premium users) */}
          {!isPremium && !loading && (
            <div className="rounded-xl border-2 border-accent-red/30 bg-bg-surface p-8 text-center">
              <p className="font-body text-[10px] font-bold uppercase tracking-wider text-accent-red mb-2">
                Monthly
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-display text-5xl text-text-primary">$9.99</span>
                <span className="font-body text-sm text-text-muted">/month</span>
              </div>
              <p className="mt-3 font-body text-sm text-text-secondary">
                Cancel anytime. No commitment.
              </p>

              {error && (
                <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2">
                  <p className="font-body text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                onClick={handleSubscribe}
                disabled={actionLoading}
                className="mt-6 w-full rounded-lg bg-accent-red py-3.5 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {actionLoading ? "Redirecting to Stripe..." : "Subscribe to PRO"}
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="h-48 animate-pulse rounded-xl bg-bg-surface" />
          )}
        </div>
      </PageWrapper>
    </div>
  );
}
