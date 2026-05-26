import { Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";

export default function NotFoundPage() {
  return (
    <div className="page-enter">
      <SEOHead title="Page Not Found" description="The page you're looking for doesn't exist." />
      <PageWrapper>
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
          <p className="font-display text-7xl uppercase tracking-tight text-white">
            4<span className="text-accent-red">0</span>4
          </p>
          <p className="font-body mt-4 max-w-md text-sm text-text-secondary">
            This road doesn't lead anywhere. The page you're looking for may have moved or never existed.
          </p>
          <Link
            to="/"
            className="mt-8 rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover cursor-pointer"
          >
            Back home
          </Link>
        </div>
      </PageWrapper>
    </div>
  );
}
