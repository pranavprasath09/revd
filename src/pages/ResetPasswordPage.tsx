import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";

export default function ResetPasswordPage() {
  const { updatePassword } = useAuthContext();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await updatePassword(password);
      if (result.success) {
        navigate("/garage");
      } else {
        setError(result.error ?? "Failed to update password.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-enter">
      <SEOHead title="Set New Password" description="Set a new password for your RevD account." />

      <PageWrapper>
        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <p className="font-display text-4xl uppercase tracking-tight text-white mb-2">
                REV<span className="text-accent-red">D</span>
              </p>
              <p className="font-body text-sm text-text-secondary">
                Enter your new password below.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-bg-surface p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    required
                    className="font-body w-full rounded-lg border border-border bg-bg-base py-3 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25"
                  />
                </div>

                <div>
                  <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••"
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
                  disabled={submitting}
                  className="w-full rounded-lg bg-accent-red py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? "..." : "Set New Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
