import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";

export default function CarsPage() {
  return (
    <>
      <SEOHead title="Browse Cars" description="Browse specs, mods, and reliability for every enthusiast car." />
      <PageWrapper>
        <h1 className="text-3xl font-bold tracking-tight">Browse Cars</h1>
        <p className="mt-2 text-text-secondary">Coming soon — full car database with filters.</p>
      </PageWrapper>
    </>
  );
}
