import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import PWButton from "@/components/pitwall/Button";
import Field from "@/components/pitwall/Field";
import { SHEET_CARS } from "@/lib/carData";

/** Validate redirect param: must start with / and not // (prevents open redirect) */
function safeRedirect(raw: string | null): string {
  if (!raw) return "/garage";
  return /^\/(?!\/)/.test(raw) ? raw : "/garage";
}

export default function SignInPage() {
  const { signIn, signUp, resetPassword, isSignedIn } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = useMemo(
    () => safeRedirect(searchParams.get("redirect")),
    [searchParams],
  );
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // The photograph — the most popular car on file
  const heroCar = useMemo(
    () => SHEET_CARS.slice().sort((a, b) => b.pop - a.pop)[0],
    [],
  );

  useEffect(() => {
    if (isSignedIn) navigate(redirectTo, { replace: true });
  }, [isSignedIn, redirectTo, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitting(true);
    try {
      if (mode === "forgot") {
        const result = await resetPassword(email);
        if (result.success) {
          setSuccessMsg("Password reset email sent! Check your inbox.");
          setError("");
        } else {
          setError(result.error ?? "Failed to send reset email.");
        }
        return;
      }

      if (mode === "signin") {
        const result = await signIn(email, password);
        if (result.success) {
          navigate(redirectTo);
        } else {
          setError(result.error ?? "Sign in failed.");
        }
      } else {
        if (displayName.trim().length < 2) {
          setError("Display name must be at least 2 characters.");
          return;
        }
        const result = await signUp(email, password, displayName.trim());
        if (result.success) {
          setError("");
          setSuccessMsg("Account created! Check your email to confirm, then sign in.");
          setMode("signin");
          setPassword("");
          setDisplayName("");
        } else {
          setError(result.error ?? "Sign up failed.");
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  const switchMode = (next: "signin" | "signup" | "forgot") => {
    setMode(next);
    setError("");
    setSuccessMsg("");
  };

  return (
    <div className="page-enter grid min-h-[calc(100vh-120px)] lg:grid-cols-2">
      <SEOHead
        title={
          mode === "signin" ? "Sign In" : mode === "signup" ? "Sign Up" : "Reset Password"
        }
        description="Sign in to your RevD account."
      />

      {/* Left — the form, Pit Wall fields inside Margin confidence */}
      <div className="flex items-center justify-center px-6 py-14 md:px-14">
        <div className="w-full max-w-[400px]">
          <div className="font-editorial text-[40px] uppercase leading-none tracking-[0.16em] text-text-primary">
            Rev<span className="text-accent">d</span>
          </div>
          <h1 className="mt-[30px] font-editorial text-[36px] font-normal leading-[1.06] text-text-primary md:text-[44px]">
            The home base for car culture.
          </h1>
          <p className="mt-3.5 font-editorial text-[17px] italic text-text-secondary">
            Free forever. Premium when you want it.
          </p>

          <form onSubmit={handleSubmit} className="mt-[34px] flex flex-col gap-[18px]">
            {mode === "signup" && (
              <Field
                label="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required
              />
            )}
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            {mode !== "forgot" && (
              <Field
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            )}

            {successMsg && (
              <p className="font-mono text-[10px] tracking-[0.08em] text-signal-green">
                {successMsg}
              </p>
            )}
            {error && (
              <p className="font-mono text-[10px] tracking-[0.08em] text-signal-red">
                {error}
              </p>
            )}

            <PWButton
              type="submit"
              disabled={submitting}
              className="w-full py-[13px] tracking-[0.2em]"
            >
              {submitting
                ? "…"
                : mode === "signin"
                  ? "Sign in"
                  : mode === "signup"
                    ? "Create account"
                    : "Send reset link"}
            </PWButton>
          </form>

          <div className="mt-[26px] flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            {mode === "signin" ? (
              <>
                <span>
                  No account?{" "}
                  <button
                    onClick={() => switchMode("signup")}
                    className="cursor-pointer border-b border-accent pb-0.5 text-text-primary hover:text-accent"
                  >
                    Create one
                  </button>
                </span>
                <button
                  onClick={() => switchMode("forgot")}
                  className="cursor-pointer text-text-muted transition-colors duration-100 hover:text-accent"
                >
                  Forgot password?
                </button>
              </>
            ) : (
              <span>
                {mode === "forgot" ? "Remember it after all?" : "Already on file?"}{" "}
                <button
                  onClick={() => switchMode("signin")}
                  className="cursor-pointer border-b border-accent pb-0.5 text-text-primary hover:text-accent"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right — full-bleed photograph. Fixed dark scrim over photography is
          deliberate; it never sits over page background. */}
      <div className="relative hidden overflow-hidden lg:block">
        {heroCar && (
          <img
            src={heroCar.hero}
            alt={`${heroCar.name} ${heroCar.gen}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div
          className="absolute inset-x-0 bottom-0 px-9 py-[30px]"
          style={{
            background: "linear-gradient(to top, rgba(10,11,13,0.92), transparent)",
          }}
        >
          <p className="font-editorial text-[17px] italic text-white/[0.82]">
            Every spec, every mod, every story — on file.
          </p>
        </div>
      </div>
    </div>
  );
}
