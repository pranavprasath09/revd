import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const LABEL_CLASS =
  "font-mono text-[9px] uppercase tracking-[0.24em] text-text-secondary";
const CONTROL_CLASS =
  "w-full box-border bg-transparent px-3 py-2.5 text-sm text-text-primary outline-none transition-colors duration-100 placeholder:text-text-muted";

const borderClass = (error?: string) =>
  error
    ? "border border-signal-red"
    : "border border-border-alpha focus:border-accent";

function FieldShell({
  label,
  error,
  hint,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-[7px] ${className}`}>
      <span className={LABEL_CLASS}>{label}</span>
      {children}
      {error && (
        <span className="font-mono text-[10px] tracking-[0.08em] text-signal-red">
          {error}
        </span>
      )}
      {hint && !error && (
        <span className="font-mono text-[10px] tracking-[0.08em] text-text-muted">
          {hint}
        </span>
      )}
    </label>
  );
}

/**
 * Pit Wall form field — mono label above a borderless-radius input.
 * Focus moves the border to accent with no glow or ring; errors go signal-red.
 */
export default function Field({
  label,
  error,
  hint,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
}) {
  return (
    <FieldShell label={label} error={error} hint={hint} className={className}>
      <input className={`${CONTROL_CLASS} ${borderClass(error)}`} {...props} />
    </FieldShell>
  );
}

export function TextareaField({
  label,
  error,
  hint,
  className = "",
  rows = 4,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
}) {
  return (
    <FieldShell label={label} error={error} hint={hint} className={className}>
      <textarea
        rows={rows}
        className={`${CONTROL_CLASS} resize-y ${borderClass(error)}`}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  error,
  hint,
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  hint?: string;
}) {
  return (
    <FieldShell label={label} error={error} hint={hint} className={className}>
      <select
        className={`${CONTROL_CLASS} cursor-pointer appearance-none bg-bg-base ${borderClass(error)}`}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}

/** Section rule inside a Pit Wall form — accent top border + mono label. */
export function FormSection({ label }: { label: string }) {
  return (
    <div className="mt-[34px] border-t border-accent pb-[18px] pt-3.5 font-mono text-[9px] uppercase tracking-[0.24em] text-accent first:mt-0">
      {label}
    </div>
  );
}
