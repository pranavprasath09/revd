import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="h-[1px] bg-gradient-to-r from-transparent via-accent-red/30 to-transparent" />
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-12 md:flex-row md:justify-between">
        <Link to="/" className="font-display text-2xl uppercase tracking-tight text-text-secondary">
          REV<span className="text-accent-red">D</span>
        </Link>
        <div className="flex gap-8">
          <Link to="/cars" className="font-body text-xs font-bold uppercase tracking-[0.15em] text-text-muted transition-colors hover:text-white">Cars</Link>
          <Link to="/news" className="font-body text-xs font-bold uppercase tracking-[0.15em] text-text-muted transition-colors hover:text-white">News</Link>
          <Link to="/compare" className="font-body text-xs font-bold uppercase tracking-[0.15em] text-text-muted transition-colors hover:text-white">Compare</Link>
        </div>
        <p className="font-body text-xs tracking-wider text-text-muted">&copy; {new Date().getFullYear()} RevD. All rights reserved.</p>
      </div>
    </footer>
  );
}
