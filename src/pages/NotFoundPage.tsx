import { Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";

export default function NotFoundPage() {
  return (
    <div className="page-enter px-6 pb-[72px] pt-[34px] md:px-11">
      <SEOHead
        title="Page Not Found"
        description="The page you're looking for doesn't exist."
      />
      <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-signal-red">
        Error
      </div>
      <h1 className="mt-2 font-mono text-[56px] font-bold leading-[0.9] tracking-[-0.045em] text-text-primary md:text-[96px]">
        404
      </h1>
      <p className="mt-4 max-w-[460px] text-[15px] leading-relaxed text-text-secondary">
        No car, build or meet at that address. It may have been deleted, or the
        URL may be wrong.
      </p>
      <div className="mt-7 flex gap-[22px]">
        <Link
          to="/"
          className="border-b border-accent pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent transition-colors duration-100 hover:text-accent-hover"
        >
          Back to dashboard
        </Link>
        <Link
          to="/cars"
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary transition-colors duration-100 hover:text-accent"
        >
          Browse cars
        </Link>
      </div>
    </div>
  );
}
