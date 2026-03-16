import { Link } from "react-router-dom";

const NAV_LINKS = [
  { to: "/cars", label: "Cars" },
  { to: "/news", label: "News" },
  { to: "/compare", label: "Compare" },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg-base/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold tracking-tight text-text-primary">
          Rev<span className="text-accent">Hub</span>
        </Link>

        <div className="flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
