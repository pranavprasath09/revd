import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="h-[2px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-10 text-text-muted md:flex-row md:justify-between">
        <Link to="/" className="text-lg font-extrabold uppercase tracking-tighter text-text-secondary">
          Rev<span className="text-accent">D</span>
        </Link>
        <div className="flex gap-6">
          <Link to="/cars" className="text-xs font-semibold uppercase tracking-wider transition-colors hover:text-text-secondary">Cars</Link>
          <Link to="/news" className="text-xs font-semibold uppercase tracking-wider transition-colors hover:text-text-secondary">News</Link>
          <Link to="/compare" className="text-xs font-semibold uppercase tracking-wider transition-colors hover:text-text-secondary">Compare</Link>
        </div>
        <p className="text-xs tracking-wider">&copy; {new Date().getFullYear()} RevD. All rights reserved.</p>
      </div>
    </footer>
  );
}
