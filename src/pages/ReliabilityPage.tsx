import { useParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";

export default function ReliabilityPage() {
  const { make, model } = useParams();

  return (
    <>
      <SEOHead
        title={`${make} ${model} Reliability`}
        description={`Reliability report for the ${make} ${model} — common issues, scores, and what to look for.`}
      />
      <PageWrapper>
        <h1 className="text-3xl font-bold tracking-tight capitalize">
          {make} {model} Reliability
        </h1>
        <p className="mt-2 text-text-secondary">Reliability report — coming soon.</p>
      </PageWrapper>
    </>
  );
}
