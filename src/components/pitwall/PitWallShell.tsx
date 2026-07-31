import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  House,
  Car,
  Newspaper,
  Shield,
  Wrench,
  Gauge,
  CalendarDays,
  MessageSquare,
  Hammer,
  Camera,
  Activity,
  Sparkles,
  User,
  Menu,
  X,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { THEMES } from "@/lib/themes";
import { supabase } from "@/lib/supabase";
import { SHEET_CARS } from "@/lib/carData";
import NotificationBell from "@/components/layout/NotificationBell";
import TelemetryStrip from "@/components/pitwall/TelemetryStrip";

/* ── Nav — sections and order unchanged from the original Sidebar ── */
interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}
const NAV_SECTIONS: { num: string; label: string; items: NavItem[] }[] = [
  {
    num: "01",
    label: "Workspace",
    items: [
      { to: "/", label: "Home", icon: House },
      { to: "/feed", label: "Feed", icon: Activity },
      { to: "/garage", label: "My Garage", icon: Gauge },
      { to: "/builds", label: "Builds", icon: Hammer },
    ],
  },
  {
    num: "02",
    label: "Explore",
    items: [
      { to: "/cars", label: "Cars", icon: Car },
      { to: "/news", label: "News", icon: Newspaper },
      { to: "/reliability", label: "Reliability", icon: Shield },
      { to: "/mods", label: "Mod Guides", icon: Wrench },
    ],
  },
  {
    num: "03",
    label: "Community",
    items: [
      { to: "/meets", label: "Car Meets", icon: CalendarDays },
      { to: "/communities", label: "Communities", icon: MessageSquare },
      { to: "/photos", label: "Photos", icon: Camera },
    ],
  },
];

function isActive(pathname: string, to: string): boolean {
  if (to === "/") return pathname === "/";
  return pathname.startsWith(to);
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      title={item.label}
      className={`group relative flex h-[30px] items-center gap-2.5 px-4 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors duration-100
        ${active ? "bg-bg-elevated text-text-primary" : "text-text-secondary hover:text-text-primary"}
        md:justify-center md:px-0 lg:justify-start lg:px-4`}
    >
      {active && <span className="absolute inset-y-0 left-0 w-0.5 bg-accent" />}
      <Icon
        size={13}
        strokeWidth={1.5}
        className={`shrink-0 ${active ? "text-accent" : "text-text-muted"}`}
      />
      <span className="md:hidden lg:inline">{item.label}</span>
    </Link>
  );
}

/** 18px livery swatch — palette base with an 8px accent square bottom-right. */
function LiverySwatches() {
  const { themeId, setTheme } = useTheme();
  return (
    <div className="flex flex-wrap gap-[5px]">
      {THEMES.map((t) => (
        <button
          key={t.id}
          title={t.name}
          aria-label={`Switch to ${t.name} theme`}
          aria-pressed={themeId === t.id}
          onClick={() => setTheme(t.id)}
          className={`flex h-[18px] w-[18px] cursor-pointer items-end justify-end border p-0 transition-colors duration-100 hover:border-accent
            ${themeId === t.id ? "border-accent" : "border-border-rule"}`}
          style={{ backgroundColor: t.preview[0] }}
        >
          <span className="h-2 w-2" style={{ backgroundColor: t.preview[1] }} />
        </button>
      ))}
    </div>
  );
}

/** Live telemetry for the shell strip: session clock + platform counts. */
function useShellTelemetry() {
  const { user, isSignedIn } = useAuthContext();
  const [now, setNow] = useState(() => new Date());
  const [meets7d, setMeets7d] = useState<number | null>(null);
  const [builds, setBuilds] = useState<number | null>(null);
  const [following, setFollowing] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let stale = false;
    async function load() {
      try {
        const today = new Date();
        const week = new Date(today.getTime() + 7 * 86400_000);
        const iso = (d: Date) => d.toISOString().slice(0, 10);
        const [meetsRes, buildsRes] = await Promise.all([
          supabase
            .from("meets")
            .select("id", { count: "exact", head: true })
            .gte("date", iso(today))
            .lte("date", iso(week)),
          supabase
            .from("build_logs")
            .select("id", { count: "exact", head: true })
            .eq("is_public", true),
        ]);
        if (stale) return;
        if (!meetsRes.error) setMeets7d(meetsRes.count ?? 0);
        if (!buildsRes.error) setBuilds(buildsRes.count ?? 0);
      } catch {
        // Strip cells fall back to em dashes
      }
    }
    load();
    return () => {
      stale = true;
    };
  }, []);

  const userId = user?.id ?? null;
  useEffect(() => {
    if (!isSignedIn || !userId) {
      setFollowing(null);
      return;
    }
    let stale = false;
    async function load() {
      try {
        const { count, error } = await supabase
          .from("follows")
          .select("id", { count: "exact", head: true })
          .eq("follower_id", userId!);
        if (!stale && !error) setFollowing(count ?? 0);
      } catch {
        // fall back to em dash
      }
    }
    load();
    return () => {
      stale = true;
    };
  }, [isSignedIn, userId]);

  const pad = (n: number) => String(n).padStart(2, "0");
  return useMemo(
    () => [
      {
        label: "Session",
        value: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
      },
      { label: "Cars on file", value: String(SHEET_CARS.length) },
      { label: "Meets / 7d", value: meets7d === null ? "—" : String(meets7d) },
      { label: "Builds active", value: builds === null ? "—" : String(builds) },
      ...(following !== null
        ? [{ label: "Following", value: String(following) }]
        : []),
    ],
    [now, meets7d, builds, following],
  );
}

/**
 * Pit Wall shell — 196px mono sidebar with numbered sections and the accent
 * rail, livery swatches in the footer, and the telemetry strip across the top
 * of the content column. Collapses to a 56px icon rail below lg, and to an
 * off-canvas drawer behind a 48px top bar below md.
 */
export default function PitWallShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isSignedIn, isPremium, signOut } = useAuthContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const telemetry = useShellTelemetry();
  const close = () => setMobileOpen(false);

  return (
    <div className="flex min-h-screen bg-bg-base text-text-primary">
      {/* ── Mobile top bar ── */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-12 items-center justify-between border-b border-border-alpha bg-bg-base px-4 md:hidden">
        <Link to="/" className="flex items-center gap-2" onClick={close}>
          <span className="anim-pulse h-[7px] w-[7px] bg-accent" />
          <span className="font-mono text-[13px] font-bold uppercase tracking-[0.22em]">
            REVD
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {isSignedIn && <NotificationBell />}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-text-secondary transition-colors duration-100 hover:text-text-primary"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={close}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-[196px] flex-col border-r border-border-alpha bg-bg-base transition-transform duration-150 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:w-14 lg:w-[196px]`}
      >
        {/* Header — pulse square + wordmark */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border-alpha px-4 md:justify-center lg:justify-between lg:px-4">
          <Link to="/" onClick={close} className="flex items-center gap-2">
            <span className="anim-pulse h-[7px] w-[7px] shrink-0 bg-accent" />
            <span className="font-mono text-[13px] font-bold uppercase tracking-[0.22em] md:hidden lg:inline">
              REVD
            </span>
          </Link>
          {isSignedIn && (
            <span className="md:hidden lg:inline-flex">
              <NotificationBell />
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.num} className="mb-[22px]">
              <div className="flex items-center gap-2 px-4 pb-2 font-mono text-[9px] uppercase tracking-[0.24em] text-text-muted md:hidden lg:flex">
                <span>{section.num}</span>
                <span className="h-px flex-1 bg-border-alpha" />
                <span>{section.label}</span>
              </div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  item={item}
                  active={isActive(location.pathname, item.to)}
                  onNavigate={close}
                />
              ))}
            </div>
          ))}

          <div className="mb-[22px]">
            <div className="flex items-center gap-2 px-4 pb-2 font-mono text-[9px] uppercase tracking-[0.24em] text-text-muted md:hidden lg:flex">
              <span>04</span>
              <span className="h-px flex-1 bg-border-alpha" />
              <span>Account</span>
            </div>
            <NavLink
              item={{ to: "/premium", label: "Premium", icon: Sparkles }}
              active={isActive(location.pathname, "/premium")}
              onNavigate={close}
            />
            {isSignedIn && user && (
              <NavLink
                item={{ to: `/profile/${user.id}`, label: "Profile", icon: User }}
                active={isActive(location.pathname, "/profile")}
                onNavigate={close}
              />
            )}
          </div>
        </nav>

        {/* Footer — livery swatches + operator line */}
        <div className="shrink-0 border-t border-border-alpha px-4 py-3">
          <div className="md:hidden lg:block">
            <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">
              Livery
            </div>
            <LiverySwatches />
          </div>
          {isSignedIn && user ? (
            <div className="mt-3.5 flex items-center justify-between gap-2 md:mt-0 md:justify-center lg:mt-3.5 lg:justify-between">
              <span className="flex items-center gap-2 font-mono text-[10px] text-text-muted md:hidden lg:flex">
                <span className="max-w-[110px] truncate uppercase text-accent">
                  {user.displayName}
                </span>
                {isPremium && (
                  <>
                    <span>·</span>
                    <span>PRO</span>
                  </>
                )}
              </span>
              <button
                onClick={async () => {
                  await signOut();
                  close();
                  navigate("/sign-in");
                }}
                title="Sign out"
                aria-label="Sign out"
                className="cursor-pointer text-text-muted transition-colors duration-100 hover:text-text-secondary"
              >
                <LogOut size={13} strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <Link
              to="/sign-in"
              onClick={close}
              className="mt-3.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-accent md:mt-0 md:text-center lg:mt-3.5 lg:text-left"
            >
              <span className="md:hidden lg:inline">Sign in</span>
              <span className="hidden md:inline lg:hidden">
                <User size={13} strokeWidth={1.5} className="mx-auto" />
              </span>
            </Link>
          )}
        </div>
      </aside>

      {/* ── Content column ── */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col pt-12 md:pl-14 md:pt-0 lg:pl-[196px]">
        <div className="hidden md:block">
          <TelemetryStrip cells={telemetry} />
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
