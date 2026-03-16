import { useParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";

export default function ModsPage() {
  const { make, model } = useParams();

  return (
    <>
      <SEOHead
        title={`${make} ${model} Mods`}
        description={`Mod guides for the ${make} ${model} — from bolt-ons to full builds.`}
      />
      <PageWrapper>
        <h1 className="text-3xl font-bold tracking-tight capitalize">
          {make} {model} Mod Guides
        </h1>
        <p className="mt-2 text-text-secondary">Mod guides — coming soon.</p>
      </PageWrapper>
    </>
  );
}
