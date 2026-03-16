import { useParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";

export default function CarDetailPage() {
  const { make, model, year } = useParams();

  return (
    <>
      <SEOHead
        title={`${year} ${make} ${model}`}
        description={`Full specs, reliability, and mod guides for the ${year} ${make} ${model}.`}
      />
      <PageWrapper>
        <h1 className="text-3xl font-bold tracking-tight capitalize">
          {year} {make} {model}
        </h1>
        <p className="mt-2 text-text-secondary">Car detail page — coming soon.</p>
      </PageWrapper>
    </>
  );
}
