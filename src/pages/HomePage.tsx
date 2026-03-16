import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";

export default function HomePage() {
  return (
    <>
      <SEOHead
        title="The Modern Automotive Enthusiast Platform"
        description="Research any car, read fresh news, find mod guides, check reliability, and connect with other enthusiasts. All in one place."
      />
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-4xl font-black tracking-tight text-text-primary sm:text-6xl">
          Every car. Every mod.{" "}
          <span className="text-accent">One platform.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary">
          Specs, reliability, mod guides, and news for the cars you love.
          Built by enthusiasts, for enthusiasts.
        </p>
      </section>
      <PageWrapper>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-border bg-bg-surface"
            />
          ))}
        </div>
      </PageWrapper>
    </>
  );
}
