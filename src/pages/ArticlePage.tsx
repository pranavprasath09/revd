import { useParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";

export default function ArticlePage() {
  const { slug } = useParams();

  return (
    <>
      <SEOHead title={slug ?? "Article"} description="Read the full article on RevHub." />
      <PageWrapper>
        <h1 className="text-3xl font-bold tracking-tight capitalize">
          {slug?.replace(/-/g, " ")}
        </h1>
        <p className="mt-2 text-text-secondary">Article page — coming soon.</p>
      </PageWrapper>
    </>
  );
}
