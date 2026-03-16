import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";

export default function NewsPage() {
  return (
    <>
      <SEOHead title="News" description="Latest automotive news from the best sources." />
      <PageWrapper>
        <h1 className="text-3xl font-bold tracking-tight">News</h1>
        <p className="mt-2 text-text-secondary">News feed — coming soon.</p>
      </PageWrapper>
    </>
  );
}
