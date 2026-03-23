import { useState } from "react";
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
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import NotificationBell from "@/components/layout/NotificationBell";
import ThemePicker from "@/components/ui/ThemePicker";

/* ── Nav structure with section grouping ─────────────── */
const NAV_SECTIONS = [
  {
    label: "Workspace",
    items: [
      { to: "/", label: "Home", icon: House },
      { to: "/feed", label: "Feed", icon: Activity },
      { to: "/garage", label: "My Garage", icon: Gauge },
      { to: "/builds", label: "Builds", icon: Hammer },
    ],
  },
  {
    label: "Explore",
    items: [
      { to: "/cars", label: "Cars", icon: Car },
      { to: "/news", label: "News", icon: Newspaper },
      { to: "/reliability", label: "Reliability", icon: Shield },
      { to: "/mods", label: "Mod Guides", icon: Wrench },
    ],
  },
  {
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

/** Shared border style using theme var */
const themeBorder = { borderColor: "var(--theme-border, rgba(255,255,255,0.08))" };

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isSignedIn, isPremium, signOut } = useAuthContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────── */}
      <div
        className="fixed top-0 left-0 right-0 z-40 flex h-12 items-center justify-between border-b bg-bg-base px-4 md:hidden"
        style={themeBorder}
      >
        <Link to="/" className="flex items-center gap-1.5">
          <span className="font-display text-[15px] tracking-[-0.03em] text-text-primary">
            rev<span className="text-accent-amber">d</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {isSignedIn && <NotificationBell />}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-text-secondary transition-colors duration-100 hover:text-text-primary cursor-pointer"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile overlay ─────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen flex-col border-r bg-bg-base transition-transform duration-150 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          w-[220px]
          md:translate-x-0 md:w-14 lg:w-[220px]
        `}
        style={themeBorder}
      >
        {/* ── Logo area ─────────────────────────────────── */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b px-4 lg:px-5" style={themeBorder}>
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center"
          >
            <span className="font-display text-[15px] tracking-[-0.03em] text-text-primary md:hidden lg:inline">
              rev<span className="text-accent-amber">d</span>
            </span>
            <span className="hidden md:inline lg:hidden font-display text-[15px] text-accent-amber">d</span>
          </Link>
          {isSignedIn && (
            <div className="hidden md:flex">
              <NotificationBell />
            </div>
          )}
        </div>

        {/* ── Navigation sections ───────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 lg:px-2.5">
          {NAV_SECTIONS.map((section, sectionIdx) => (
            <div key={section.label} className={sectionIdx > 0 ? "mt-5" : ""}>
              <div className="nav-section-label mb-1 hidden lg:block">
                {section.label}
              </div>
              {sectionIdx > 0 && (
                <div className="mx-2 mb-2 hidden border-t md:block lg:hidden" style={{ borderColor: "var(--theme-border, rgba(255,255,255,0.06))" }} />
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(location.pathname, item.to);
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={`group relative flex h-8 items-center gap-2.5 rounded-md px-2.5 font-body text-[13px] font-medium transition-colors duration-100
                          ${active
                            ? "bg-bg-elevated text-text-primary"
                            : "text-text-secondary hover:bg-bg-elevated/60 hover:text-text-primary"
                          }
                          md:justify-center md:h-9 md:w-9 md:mx-auto md:rounded-md md:px-0 lg:justify-start lg:h-8 lg:w-auto lg:mx-0 lg:px-2.5
                        `}
                        title={item.label}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-sm bg-accent-amber" />
                        )}
                        <Icon
                          size={16}
                          strokeWidth={active ? 2 : 1.5}
                          className={`shrink-0 transition-colors duration-100 ${
                            active ? "text-accent-amber" : "text-text-muted group-hover:text-text-secondary"
                          }`}
                        />
                        <span className="md:hidden lg:inline truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* ── Premium + Profile ─────────────────────────── */}
          <div className="mt-5">
            <div className="nav-section-label mb-1 hidden lg:block">Account</div>
            <div className="mx-2 mb-2 hidden border-t md:block lg:hidden" style={{ borderColor: "var(--theme-border, rgba(255,255,255,0.06))" }} />
            <ul className="space-y-0.5">
              <li>
                <Link
                  to="/premium"
                  onClick={() => setMobileOpen(false)}
                  className={`group relative flex h-8 items-center gap-2.5 rounded-md px-2.5 font-body text-[13px] font-medium transition-colors duration-100
                    ${isActive(location.pathname, "/premium")
                      ? "bg-bg-elevated text-text-primary"
                      : "text-text-secondary hover:bg-bg-elevated/60 hover:text-text-primary"
                    }
                    md:justify-center md:h-9 md:w-9 md:mx-auto md:rounded-md md:px-0 lg:justify-start lg:h-8 lg:w-auto lg:mx-0 lg:px-2.5
                  `}
                  title="Premium"
                >
                  {isActive(location.pathname, "/premium") && (
                    <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-sm bg-accent-amber" />
                  )}
                  <Sparkles
                    size={16}
                    strokeWidth={isActive(location.pathname, "/premium") ? 2 : 1.5}
                    className={`shrink-0 transition-colors duration-100 ${
                      isActive(location.pathname, "/premium") ? "text-accent-amber" : "text-text-muted group-hover:text-text-secondary"
                    }`}
                  />
                  <span className="md:hidden lg:inline">Premium</span>
                </Link>
              </li>
              {isSignedIn && user && (() => {
                const profilePath = `/profile/${user.displayName ? encodeURIComponent(user.displayName.replace(/\s+/g, "-")) : user.id}`;
                const active = isActive(location.pathname, "/profile");
                return (
                  <li>
                    <Link
                      to={profilePath}
                      onClick={() => setMobileOpen(false)}
                      className={`group relative flex h-8 items-center gap-2.5 rounded-md px-2.5 font-body text-[13px] font-medium transition-colors duration-100
                        ${active
                          ? "bg-bg-elevated text-text-primary"
                          : "text-text-secondary hover:bg-bg-elevated/60 hover:text-text-primary"
                        }
                        md:justify-center md:h-9 md:w-9 md:mx-auto md:rounded-md md:px-0 lg:justify-start lg:h-8 lg:w-auto lg:mx-0 lg:px-2.5
                      `}
                      title="Profile"
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-sm bg-accent-amber" />
                      )}
                      <User
                        size={16}
                        strokeWidth={active ? 2 : 1.5}
                        className={`shrink-0 transition-colors duration-100 ${
                          active ? "text-accent-amber" : "text-text-muted group-hover:text-text-secondary"
                        }`}
                      />
                      <span className="md:hidden lg:inline">Profile</span>
                    </Link>
                  </li>
                );
              })()}
            </ul>
          </div>
        </nav>

        {/* ── Bottom — Auth section ────────────────────── */}
        <div className="shrink-0 border-t p-2.5 lg:p-3" style={themeBorder}>
          {/* Theme picker */}
          <div className="mb-1 flex items-center md:justify-center lg:justify-start">
            <ThemePicker />
          </div>
          {isSignedIn && user ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 rounded-md px-2.5 py-2 md:justify-center md:px-0 lg:justify-start lg:px-2.5">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isPremium ? "bg-accent-dim" : "bg-bg-elevated"}`}
                  style={{ border: `1px solid var(--theme-border, rgba(255,255,255,0.08))` }}
                >
                  <span className={`font-mono text-[10px] font-semibold ${isPremium ? "text-accent-amber" : "text-text-secondary"}`}>
                    {user.avatar ?? user.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left md:hidden lg:block min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-body text-[12px] font-medium text-text-primary truncate">{user.displayName}</p>
                    {isPremium && (
                      <span className="rounded bg-accent-dim px-1 py-px font-mono text-[9px] font-semibold tracking-wide text-accent-amber">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="font-body text-[10px] text-text-muted truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={async () => { await signOut(); setMobileOpen(false); navigate("/sign-in"); }}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-text-muted hover:bg-bg-elevated/60 hover:text-text-secondary transition-colors duration-100 md:justify-center md:px-0 lg:justify-start lg:px-2.5 cursor-pointer"
                title="Sign out"
              >
                <LogOut size={14} strokeWidth={1.5} className="shrink-0" />
                <span className="font-body text-[12px] md:hidden lg:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors duration-100 hover:bg-bg-elevated/60 md:justify-center md:px-0 lg:justify-start lg:px-2.5"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-elevated"
                style={{ border: `1px solid var(--theme-border, rgba(255,255,255,0.08))` }}
              >
                <svg className="h-3.5 w-3.5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="text-left md:hidden lg:block">
                <p className="font-body text-[12px] font-medium text-accent-amber">Sign In</p>
                <p className="font-body text-[10px] text-text-muted">Access your workspace</p>
              </div>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
