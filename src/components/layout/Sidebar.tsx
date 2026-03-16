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
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: House },
  { to: "/cars", label: "Cars", icon: Car },
  { to: "/news", label: "News", icon: Newspaper },
  { to: "/reliability", label: "Reliability", icon: Shield },
  { to: "/mods", label: "Mod Guides", icon: Wrench },
  { to: "/garage", label: "My Garage", icon: Gauge },
  { to: "/events", label: "Car Events", icon: CalendarDays },
];

function isActive(pathname: string, to: string): boolean {
  if (to === "/") return pathname === "/";
  return pathname.startsWith(to);
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isSignedIn, isPremium, signOut } = useAuthContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-[#2a2a2a] bg-[#0f0f0f] px-4 md:hidden">
        <Link to="/" className="font-display text-xl uppercase tracking-tight text-white">
          REV<span className="text-accent-red">D</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:text-white"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-[#2a2a2a] bg-[#0f0f0f] transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          w-[240px]
          md:translate-x-0 md:w-16 lg:w-[240px]
        `}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center border-b border-[#2a2a2a] px-5 lg:px-6">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="font-display text-2xl uppercase tracking-tight text-white"
          >
            <span className="md:hidden lg:inline">REV<span className="text-accent-red">D</span></span>
            <span className="hidden md:inline lg:hidden text-accent-red">D</span>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 lg:px-3">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(location.pathname, item.to);
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm font-medium transition-all duration-200
                      ${active
                        ? "bg-[#1a1a1a] text-white"
                        : "text-[#606060] hover:bg-[#1a1a1a] hover:text-white"
                      }
                      md:justify-center md:px-0 lg:justify-start lg:px-3
                    `}
                    title={item.label}
                  >
                    {/* Red left border for active */}
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent-red" />
                    )}
                    <Icon
                      size={20}
                      className={`shrink-0 transition-colors ${
                        active ? "text-accent-red" : "text-[#606060] group-hover:text-accent-red"
                      }`}
                    />
                    <span className="md:hidden lg:inline">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section — Auth */}
        <div className="shrink-0 border-t border-[#2a2a2a] p-3 lg:p-4">
          {isSignedIn && user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 md:justify-center md:px-0 lg:justify-start lg:px-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#2a2a2a] ${isPremium ? "bg-accent-red/20" : "bg-[#242424]"}`}>
                  <span className={`font-mono text-xs font-bold ${isPremium ? "text-accent-red" : "text-text-muted"}`}>
                    {user.avatar ?? user.displayName.charAt(0)}
                  </span>
                </div>
                <div className="text-left md:hidden lg:block min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-body text-xs font-bold text-text-primary truncate">{user.displayName}</p>
                    {isPremium && (
                      <span className="rounded-full bg-accent-red/10 px-1.5 py-0.5 font-body text-[8px] font-bold uppercase tracking-wider text-accent-red">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="font-body text-[10px] text-text-muted truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => { signOut(); setMobileOpen(false); navigate("/"); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-text-muted hover:bg-[#1a1a1a] hover:text-white transition-all md:justify-center md:px-0 lg:justify-start lg:px-3 cursor-pointer"
                title="Sign out"
              >
                <LogOut size={16} className="shrink-0" />
                <span className="font-body text-xs md:hidden lg:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-[#1a1a1a] md:justify-center md:px-0 lg:justify-start lg:px-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#242424] border border-[#2a2a2a]">
                <svg className="h-4 w-4 text-[#606060]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="text-left md:hidden lg:block">
                <p className="font-body text-xs font-bold text-accent-red">Sign In</p>
                <p className="font-body text-[10px] text-text-muted">Join the community</p>
              </div>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
