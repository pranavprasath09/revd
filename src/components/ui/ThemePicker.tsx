import { useState, useRef, useEffect } from "react";
import { Palette } from "lucide-react";
import { THEMES } from "@/lib/themes";
import { useTheme } from "@/hooks/useTheme";

export default function ThemePicker() {
  const { themeId, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const darkThemes = THEMES.filter((t) => t.mode === "dark");
  const lightThemes = THEMES.filter((t) => t.mode === "light");

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-100 hover:bg-white/[0.04] hover:text-text-secondary cursor-pointer"
        aria-label="Change theme"
        title="Change theme"
      >
        <Palette size={14} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-[220px] rounded-lg border bg-bg-surface p-2 shadow-xl shadow-black/40 lg:left-0 lg:bottom-full"
          style={{ borderColor: "var(--theme-border, rgba(255,255,255,0.08))" }}
        >
          {/* Dark themes */}
          <p className="px-2 pb-1.5 pt-1 font-body text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Dark
          </p>
          <div className="space-y-0.5">
            {darkThemes.map((theme) => (
              <ThemeRow
                key={theme.id}
                theme={theme}
                active={themeId === theme.id}
                onSelect={() => { setTheme(theme.id); setOpen(false); }}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="my-2 border-t" style={{ borderColor: "var(--theme-border, rgba(255,255,255,0.08))" }} />

          {/* Light themes */}
          <p className="px-2 pb-1.5 font-body text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Light
          </p>
          <div className="space-y-0.5">
            {lightThemes.map((theme) => (
              <ThemeRow
                key={theme.id}
                theme={theme}
                active={themeId === theme.id}
                onSelect={() => { setTheme(theme.id); setOpen(false); }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeRow({ theme, active, onSelect }: {
  theme: (typeof THEMES)[number];
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors duration-100 cursor-pointer
        ${active
          ? "bg-accent-dim text-text-primary"
          : "text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
        }
      `}
    >
      {/* Dual swatch — background + accent */}
      <span className="flex h-4 w-4 shrink-0 overflow-hidden rounded-full border border-white/10">
        <span className="h-full w-1/2" style={{ backgroundColor: theme.preview[0] }} />
        <span className="h-full w-1/2" style={{ backgroundColor: theme.preview[1] }} />
      </span>
      <span className="flex-1 font-body text-[12px] font-medium">
        {theme.name}
      </span>
      {active && (
        <span className="font-mono text-[10px] text-accent-amber">&#10003;</span>
      )}
    </button>
  );
}
