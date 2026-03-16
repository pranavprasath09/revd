import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";
import { TEST_ACCOUNT_INFO } from "@/hooks/useAuth";

export default function SignInPage() {
  const { signIn, isSignedIn } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Redirect if already signed in
  if (isSignedIn) {
    navigate("/garage", { replace: true });
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = signIn(email, password);
    if (result.success) {
      navigate("/garage");
    } else {
      setError(result.error ?? "Sign in failed.");
    }
  }

  function quickSignIn(testEmail: string) {
    setError("");
    const result = signIn(testEmail, "revd");
    if (result.success) {
      navigate("/garage");
    }
  }

  return (
    <div className="page-enter">
      <SEOHead title="Sign In" description="Sign in to your RevD account." />

      <PageWrapper>
        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <p className="font-display text-4xl uppercase tracking-tight text-white mb-2">
                REV<span className="text-accent-red">D</span>
              </p>
              <p className="font-body text-sm text-text-secondary">
                Sign in to access your garage and premium content.
              </p>
            </div>

            {/* Sign in form */}
            <div className="rounded-2xl border border-border bg-bg-surface p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="font-body w-full rounded-lg border border-border bg-bg-base py-3 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25"
                  />
                </div>

                <div>
                  <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••"
                    required
                    className="font-body w-full rounded-lg border border-border bg-bg-base py-3 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-400/10 border border-red-400/20 px-4 py-3">
                    <p className="font-body text-sm text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-lg bg-accent-red py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover cursor-pointer"
                >
                  Sign In
                </button>
              </form>
            </div>

            {/* Quick sign-in test accounts */}
            <div className="mt-6 rounded-2xl border border-accent-red/20 bg-accent-red/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="h-4 w-4 text-accent-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="font-body text-xs font-bold uppercase tracking-wider text-accent-red">
                  Quick Sign-In (Test Accounts)
                </p>
              </div>
              <div className="space-y-3">
                {TEST_ACCOUNT_INFO.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => quickSignIn(account.email)}
                    className="group flex w-full items-center gap-4 rounded-xl border border-border bg-bg-surface p-4 text-left transition-all hover:border-accent-red/30 hover:shadow-lg hover:shadow-accent-red/5 cursor-pointer"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      account.tier === "premium" ? "bg-accent-red/20" : "bg-white/10"
                    }`}>
                      <span className={`font-mono text-sm font-bold ${
                        account.tier === "premium" ? "text-accent-red" : "text-text-secondary"
                      }`}>
                        {account.tier === "premium" ? "P" : "F"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm text-text-primary">{account.email}</p>
                        <span className={`rounded-full px-2 py-0.5 font-body text-[9px] font-bold uppercase tracking-wider ${
                          account.tier === "premium"
                            ? "bg-accent-red/10 text-accent-red"
                            : "bg-white/10 text-text-muted"
                        }`}>
                          {account.tier}
                        </span>
                      </div>
                      <p className="font-body text-xs text-text-muted mt-0.5">{account.label}</p>
                    </div>
                    <svg className="h-4 w-4 text-text-muted group-hover:text-accent-red transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}
              </div>
              <p className="font-mono text-[10px] text-text-muted mt-3 text-center">
                Password for both: <span className="text-text-secondary font-bold">revd</span>
              </p>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
