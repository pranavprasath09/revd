import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import PWButton from "@/components/pitwall/Button";
import Field from "@/components/pitwall/Field";

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

    if (password.length < 10) {
      setError("Password must be at least 10 characters.");
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
    <div className="page-enter flex min-h-[80vh] items-center justify-center px-6">
      <SEOHead
        title="Set New Password"
        description="Set a new password for your RevD account."
      />

      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2">
          <span className="anim-pulse h-[7px] w-[7px] bg-accent" />
          <span className="font-mono text-[13px] font-bold uppercase tracking-[0.22em] text-text-primary">
            REVD
          </span>
        </div>
        <h1 className="mt-6 font-mono text-[28px] font-bold uppercase leading-none tracking-[-0.035em] text-text-primary">
          New password
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          At least 10 characters. Make it one you haven't used before.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-[18px]">
          <Field
            label="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
            required
          />
          <Field
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••••"
            required
          />
          {error && (
            <p className="font-mono text-[10px] tracking-[0.08em] text-signal-red">
              {error}
            </p>
          )}
          <PWButton type="submit" disabled={submitting} className="w-full">
            {submitting ? "Saving…" : "Set new password"}
          </PWButton>
        </form>
      </div>
    </div>
  );
}
