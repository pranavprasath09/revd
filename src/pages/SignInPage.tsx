import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";

export default function SignInPage() {
  const { signIn, signUp, isSignedIn } = useAuthContext();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  // Redirect if already signed in
  if (isSignedIn) {
    navigate("/garage", { replace: true });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "signin") {
      const result = await signIn(email, password);
      if (result.success) {
        navigate("/garage");
      } else {
        setError(result.error ?? "Sign in failed.");
      }
    } else {
      const result = await signUp(email, password);
      if (result.success) {
        setError("");
        setMode("signin");
        setPassword("");
        setDisplayName("");
      } else {
        setError(result.error ?? "Sign up failed.");
      }
    }
  }

  return (
    <div className="page-enter">
      <SEOHead title={mode === "signin" ? "Sign In" : "Sign Up"} description="Sign in to your RevD account." />

      <PageWrapper>
        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <p className="font-display text-4xl uppercase tracking-tight text-white mb-2">
                REV<span className="text-accent-red">D</span>
              </p>
              <p className="font-body text-sm text-text-secondary">
                {mode === "signin"
                  ? "Sign in to access your garage and premium content."
                  : "Create an account to get started."}
              </p>
            </div>

            {/* Form */}
            <div className="rounded-2xl border border-border bg-bg-surface p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="font-body w-full rounded-lg border border-border bg-bg-base py-3 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25"
                    />
                  </div>
                )}

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
                  {mode === "signin" ? "Sign In" : "Sign Up"}
                </button>
              </form>
            </div>

            {/* Mode toggle */}
            <p className="text-center mt-6 font-body text-sm text-text-secondary">
              {mode === "signin" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => { setMode("signup"); setError(""); }}
                    className="text-accent-red hover:text-accent-hover font-semibold cursor-pointer"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => { setMode("signin"); setError(""); }}
                    className="text-accent-red hover:text-accent-hover font-semibold cursor-pointer"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>

          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
