import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";

export default function ComparePage() {
  return (
    <>
      <SEOHead title="Compare Cars" description="Compare specs side by side for any enthusiast cars." />
      <PageWrapper>
        <h1 className="text-3xl font-bold tracking-tight">Compare Cars</h1>
        <p className="mt-2 text-text-secondary">Side-by-side comparison — coming soon.</p>
      </PageWrapper>
    </>
  );
}
