export interface ThemePalette {
  id: string;
  name: string;
  mode: "dark" | "light";
  // Backgrounds
  bgBase: string;
  bgSurface: string;
  bgElevated: string;
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  // Borders
  borderAlpha: string; // e.g. "rgba(255,255,255,0.08)" or "rgba(0,0,0,0.08)"
  // Accent
  accent: string;
  accentHover: string;
  accentDim: string;
  // Signals
  signalGreen: string;
  signalRed: string;
  // Preview swatches [background, accent]
  preview: [string, string];
}

export const THEMES: ThemePalette[] = [
  // ── DARK THEMES ──────────────────────────────────────
  {
    id: "amber",
    name: "Amber Command",
    mode: "dark",
    bgBase: "#0A0B0D",
    bgSurface: "#111214",
    bgElevated: "#1A1B1E",
    textPrimary: "#E8E8ED",
    textSecondary: "#6B6F76",
    textMuted: "#3D4047",
    borderAlpha: "rgba(255,255,255,0.08)",
    accent: "#F5A623",
    accentHover: "#D4910F",
    accentDim: "rgba(245,166,35,0.12)",
    signalGreen: "#00D4AA",
    signalRed: "#FF4757",
    preview: ["#0A0B0D", "#F5A623"],
  },
  {
    id: "red",
    name: "Carbon Red",
    mode: "dark",
    bgBase: "#0A0B0D",
    bgSurface: "#111214",
    bgElevated: "#1A1B1E",
    textPrimary: "#E8E8ED",
    textSecondary: "#6B6F76",
    textMuted: "#3D4047",
    borderAlpha: "rgba(255,255,255,0.08)",
    accent: "#E63946",
    accentHover: "#C1121F",
    accentDim: "rgba(230,57,70,0.12)",
    signalGreen: "#00D4AA",
    signalRed: "#FF4757",
    preview: ["#0A0B0D", "#E63946"],
  },
  {
    id: "teal",
    name: "Electric Teal",
    mode: "dark",
    bgBase: "#0A0B0D",
    bgSurface: "#111214",
    bgElevated: "#1A1B1E",
    textPrimary: "#E8E8ED",
    textSecondary: "#6B6F76",
    textMuted: "#3D4047",
    borderAlpha: "rgba(255,255,255,0.08)",
    accent: "#00D4AA",
    accentHover: "#00B894",
    accentDim: "rgba(0,212,170,0.12)",
    signalGreen: "#7BED9F",
    signalRed: "#FF4757",
    preview: ["#0A0B0D", "#00D4AA"],
  },
  {
    id: "violet",
    name: "Deep Violet",
    mode: "dark",
    bgBase: "#0B0A10",
    bgSurface: "#12111A",
    bgElevated: "#1B1924",
    textPrimary: "#E8E6F0",
    textSecondary: "#6E6A80",
    textMuted: "#3F3B50",
    borderAlpha: "rgba(255,255,255,0.07)",
    accent: "#A78BFA",
    accentHover: "#8B5CF6",
    accentDim: "rgba(167,139,250,0.12)",
    signalGreen: "#00D4AA",
    signalRed: "#FF6B81",
    preview: ["#0B0A10", "#A78BFA"],
  },
  {
    id: "midnight",
    name: "Midnight Blue",
    mode: "dark",
    bgBase: "#080C14",
    bgSurface: "#0E1320",
    bgElevated: "#161D2E",
    textPrimary: "#E0E4ED",
    textSecondary: "#606882",
    textMuted: "#364060",
    borderAlpha: "rgba(140,160,220,0.10)",
    accent: "#5B8DEF",
    accentHover: "#4070D4",
    accentDim: "rgba(91,141,239,0.12)",
    signalGreen: "#00D4AA",
    signalRed: "#FF4757",
    preview: ["#080C14", "#5B8DEF"],
  },
  {
    id: "rose-dark",
    name: "Neon Rose",
    mode: "dark",
    bgBase: "#0D0A0B",
    bgSurface: "#141112",
    bgElevated: "#1E1A1B",
    textPrimary: "#EDE8E9",
    textSecondary: "#7A6E70",
    textMuted: "#4A4042",
    borderAlpha: "rgba(255,255,255,0.07)",
    accent: "#FF6B9D",
    accentHover: "#E84580",
    accentDim: "rgba(255,107,157,0.12)",
    signalGreen: "#00D4AA",
    signalRed: "#FF4757",
    preview: ["#0D0A0B", "#FF6B9D"],
  },
  {
    id: "emerald",
    name: "Emerald Terminal",
    mode: "dark",
    bgBase: "#060D0A",
    bgSurface: "#0C1410",
    bgElevated: "#141E18",
    textPrimary: "#E0EDE6",
    textSecondary: "#5E7A6A",
    textMuted: "#354840",
    borderAlpha: "rgba(100,220,160,0.08)",
    accent: "#34D399",
    accentHover: "#10B981",
    accentDim: "rgba(52,211,153,0.12)",
    signalGreen: "#6EE7B7",
    signalRed: "#FF6B81",
    preview: ["#060D0A", "#34D399"],
  },

  // ── LIGHT THEMES ─────────────────────────────────────
  {
    id: "clean-white",
    name: "Clean White",
    mode: "light",
    bgBase: "#FAFAFA",
    bgSurface: "#FFFFFF",
    bgElevated: "#F0F0F2",
    textPrimary: "#1A1A1E",
    textSecondary: "#6B6F76",
    textMuted: "#A0A4AC",
    borderAlpha: "rgba(0,0,0,0.08)",
    accent: "#1A1A1E",
    accentHover: "#333338",
    accentDim: "rgba(26,26,30,0.08)",
    signalGreen: "#059669",
    signalRed: "#DC2626",
    preview: ["#FAFAFA", "#1A1A1E"],
  },
  {
    id: "snow-blue",
    name: "Snow Blue",
    mode: "light",
    bgBase: "#F5F7FB",
    bgSurface: "#FFFFFF",
    bgElevated: "#EBF0F7",
    textPrimary: "#1A1F2E",
    textSecondary: "#5A6478",
    textMuted: "#9AA2B4",
    borderAlpha: "rgba(30,60,120,0.08)",
    accent: "#2563EB",
    accentHover: "#1D4ED8",
    accentDim: "rgba(37,99,235,0.08)",
    signalGreen: "#059669",
    signalRed: "#DC2626",
    preview: ["#F5F7FB", "#2563EB"],
  },
  {
    id: "paper",
    name: "Warm Paper",
    mode: "light",
    bgBase: "#FAF8F5",
    bgSurface: "#FFFFFF",
    bgElevated: "#F2EFE9",
    textPrimary: "#2D2A24",
    textSecondary: "#78746A",
    textMuted: "#B0AB9F",
    borderAlpha: "rgba(80,60,20,0.08)",
    accent: "#B8860B",
    accentHover: "#996F08",
    accentDim: "rgba(184,134,11,0.08)",
    signalGreen: "#059669",
    signalRed: "#DC2626",
    preview: ["#FAF8F5", "#B8860B"],
  },
  {
    id: "lavender",
    name: "Soft Lavender",
    mode: "light",
    bgBase: "#F8F6FC",
    bgSurface: "#FFFFFF",
    bgElevated: "#EFECF6",
    textPrimary: "#1E1A2E",
    textSecondary: "#6A6280",
    textMuted: "#A8A0BE",
    borderAlpha: "rgba(80,50,140,0.07)",
    accent: "#7C3AED",
    accentHover: "#6D28D9",
    accentDim: "rgba(124,58,237,0.08)",
    signalGreen: "#059669",
    signalRed: "#DC2626",
    preview: ["#F8F6FC", "#7C3AED"],
  },
  {
    id: "mint",
    name: "Cool Mint",
    mode: "light",
    bgBase: "#F4FAF8",
    bgSurface: "#FFFFFF",
    bgElevated: "#E8F4F0",
    textPrimary: "#1A2E28",
    textSecondary: "#5A7A70",
    textMuted: "#98B4AA",
    borderAlpha: "rgba(20,100,70,0.07)",
    accent: "#0D9488",
    accentHover: "#0F766E",
    accentDim: "rgba(13,148,136,0.08)",
    signalGreen: "#059669",
    signalRed: "#DC2626",
    preview: ["#F4FAF8", "#0D9488"],
  },
  {
    id: "rose-light",
    name: "Blush Rose",
    mode: "light",
    bgBase: "#FBF6F7",
    bgSurface: "#FFFFFF",
    bgElevated: "#F5ECED",
    textPrimary: "#2E1A1E",
    textSecondary: "#806068",
    textMuted: "#BEA0A8",
    borderAlpha: "rgba(140,40,60,0.06)",
    accent: "#E11D48",
    accentHover: "#BE123C",
    accentDim: "rgba(225,29,72,0.08)",
    signalGreen: "#059669",
    signalRed: "#DC2626",
    preview: ["#FBF6F7", "#E11D48"],
  },
];

export const DEFAULT_THEME_ID = "amber";

export function getThemeById(id: string): ThemePalette {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/** Apply full theme palette to CSS custom properties on :root */
export function applyTheme(theme: ThemePalette) {
  const root = document.documentElement;

  // Backgrounds
  root.style.setProperty("--color-bg-base", theme.bgBase);
  root.style.setProperty("--color-bg-surface", theme.bgSurface);
  root.style.setProperty("--color-bg-elevated", theme.bgElevated);

  // Text
  root.style.setProperty("--color-text-primary", theme.textPrimary);
  root.style.setProperty("--color-text-secondary", theme.textSecondary);
  root.style.setProperty("--color-text-muted", theme.textMuted);

  // Accents
  root.style.setProperty("--color-accent-amber", theme.accent);
  root.style.setProperty("--color-accent-red", theme.accent); // alias for backward compat
  root.style.setProperty("--color-accent-hover", theme.accentHover);
  root.style.setProperty("--color-accent-dim", theme.accentDim);

  // Signals
  root.style.setProperty("--color-signal-green", theme.signalGreen);
  root.style.setProperty("--color-signal-red", theme.signalRed);

  // Borders — components use border-white/[0.08] or border-black/[0.08] via Tailwind
  // We set a CSS var that can be picked up by the border utility
  root.style.setProperty("--theme-border", theme.borderAlpha);

  // Scrollbar
  root.style.setProperty("--scrollbar-thumb", theme.accent + "40");
  root.style.setProperty("--scrollbar-thumb-hover", theme.accent + "70");
  root.style.setProperty("--scrollbar-track", theme.bgSurface);

  // Body background directly (for the base body element)
  document.body.style.backgroundColor = theme.bgBase;
  document.body.style.color = theme.textPrimary;
}
