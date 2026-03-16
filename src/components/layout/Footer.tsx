import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-sm text-text-muted md:flex-row md:justify-between">
        <Link to="/" className="font-semibold text-text-secondary">
          Rev<span className="text-accent">D</span>
        </Link>
        <div className="flex gap-6">
          <Link to="/cars" className="transition-colors hover:text-text-secondary">Cars</Link>
          <Link to="/news" className="transition-colors hover:text-text-secondary">News</Link>
          <Link to="/compare" className="transition-colors hover:text-text-secondary">Compare</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} RevD. All rights reserved.</p>
      </div>
    </footer>
  );
}
