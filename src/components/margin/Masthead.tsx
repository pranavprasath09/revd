import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { THEMES } from "@/lib/themes";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Issue line — a running number and the current month. */
function issueLine(): string {
  const now = new Date();
  const no = (now.getFullYear() - 2023) * 12 + now.getMonth() + 6;
  return `No. ${String(no).padStart(3, "0")} · ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

function ThemeDots() {
  const { themeId, setTheme } = useTheme();
  return (
    <div className="flex items-center gap-1.5">
      {THEMES.map((t) => (
        <button
          key={t.id}
          title={t.name}
          aria-label={`Switch to ${t.name} theme`}
          aria-pressed={themeId === t.id}
          onClick={() => setTheme(t.id)}
          className={`h-[13px] w-[13px] cursor-pointer rounded-full border p-0 transition-transform duration-100 hover:scale-135
            ${themeId === t.id ? "border-accent" : "border-border-rule"}`}
          style={{ backgroundColor: t.preview[1] }}
        />
      ))}
    </div>
  );
}

interface NavWord {
  label: string;
  to: string;
  match: (pathname: string) => boolean;
}

/**
 * Margin masthead — replaces the sidebar entirely. Issue line, serif
 * wordmark, theme dots, and centred mono nav words.
 */
export default function Masthead() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isSignedIn, signOut } = useAuthContext();

  // Every section of the app is reachable from the masthead — the word row
  // mirrors the Pit Wall sidebar's order: workspace, explore, community.
  const words: NavWord[] = [
    { label: "Home", to: "/", match: (p) => p === "/" },
    { label: "Feed", to: "/feed", match: (p) => p.startsWith("/feed") },
    { label: "Garage", to: "/garage", match: (p) => p.startsWith("/garage") },
    { label: "Builds", to: "/builds", match: (p) => p.startsWith("/builds") },
    { label: "Cars", to: "/cars", match: (p) => p.startsWith("/cars") },
    { label: "News", to: "/news", match: (p) => p.startsWith("/news") },
    {
      label: "Reliability",
      to: "/reliability",
      match: (p) => p.startsWith("/reliability"),
    },
    { label: "Mods", to: "/mods", match: (p) => p.startsWith("/mods") },
    { label: "Meets", to: "/meets", match: (p) => p.startsWith("/meets") },
    {
      label: "Communities",
      to: "/communities",
      match: (p) => p.startsWith("/communities"),
    },
    { label: "Photos", to: "/photos", match: (p) => p.startsWith("/photos") },
    { label: "Premium", to: "/premium", match: (p) => p.startsWith("/premium") },
    ...(isSignedIn && user
      ? [
          {
            label: "Profile",
            to: `/profile/${user.id}`,
            match: (p: string) => p.startsWith("/profile"),
          },
        ]
      : []),
  ];

  return (
    <header className="shrink-0 border-b border-border-alpha bg-bg-base">
      <div className="flex items-center justify-between px-6 pb-3.5 pt-5 md:px-14">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted max-md:hidden">
          {issueLine()}
        </span>
        <Link
          to="/"
          className="font-editorial text-[28px] uppercase leading-none tracking-[0.16em] text-text-primary md:text-[40px]"
        >
          Rev<span className="text-accent">d</span>
        </Link>
        <ThemeDots />
      </div>
      <nav className="flex items-center gap-7 overflow-x-auto px-6 pb-3.5 md:justify-center md:px-14">
        {words.map((w) => {
          const current = w.match(location.pathname);
          return (
            <Link
              key={w.label}
              to={w.to}
              aria-current={current ? "page" : undefined}
              className={`whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-100 hover:underline hover:underline-offset-4
                ${current ? "text-accent" : "text-text-secondary hover:text-accent"}`}
            >
              {w.label}
            </Link>
          );
        })}
        {isSignedIn ? (
          <button
            onClick={async () => {
              await signOut();
              navigate("/sign-in");
            }}
            className="cursor-pointer whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted transition-colors duration-100 hover:text-accent hover:underline hover:underline-offset-4"
          >
            Sign out
          </button>
        ) : (
          <Link
            to="/sign-in"
            aria-current={location.pathname === "/sign-in" ? "page" : undefined}
            className={`whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-100 hover:underline hover:underline-offset-4
              ${location.pathname === "/sign-in" ? "text-accent" : "text-text-secondary hover:text-accent"}`}
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
