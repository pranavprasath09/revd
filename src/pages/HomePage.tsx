import { Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import SearchBar from "@/components/ui/SearchBar";
import CarCard from "@/components/cars/CarCard";
import ArticleCard from "@/components/news/ArticleCard";
import carsData from "@/data/cars.json";
import newsData from "@/data/news.json";
import type { Car } from "@/types/car";
import type { Article } from "@/types/news";

const cars = carsData as Car[];
const articles = newsData as Article[];

export default function HomePage() {
  return (
    <>
      <SEOHead
        title="The Modern Automotive Enthusiast Platform"
        description="Research any car, read fresh news, find mod guides, check reliability, and connect with other enthusiasts. All in one place."
      />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:pb-24 sm:pt-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h1 className="text-4xl font-black tracking-tight text-text-primary sm:text-5xl md:text-6xl" style={{ letterSpacing: "-0.02em" }}>
            Every car. Every mod.{" "}
            <span className="text-accent">One platform.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-text-secondary sm:text-lg">
            Specs, reliability, mod guides, and news for the cars you love.
            Built by enthusiasts, for enthusiasts.
          </p>

          <div className="mt-8 w-full sm:mt-10">
            <SearchBar cars={cars} placeholder="Search any car — try 'Supra' or 'BMW E46'" />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-text-muted">
            <span>Popular:</span>
            {["BMW E46", "Supra A80", "MX-5 Miata"].map((term) => (
              <Link
                key={term}
                to="/cars"
                className="rounded-full border border-border bg-bg-surface px-3 py-1 text-text-secondary transition-colors hover:border-accent/40 hover:text-text-primary"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Featured Cars
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              The most popular enthusiast cars on the platform
            </p>
          </div>
          <Link
            to="/cars"
            className="hidden text-sm font-medium text-accent transition-colors hover:text-accent-hover sm:block"
          >
            View all &rarr;
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cars.slice(0, 6).map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/cars"
            className="inline-block rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            View all cars &rarr;
          </Link>
        </div>
      </section>

      {/* Latest News */}
      <section className="border-t border-border bg-bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Latest News
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Fresh from the automotive world
              </p>
            </div>
            <Link
              to="/news"
              className="hidden text-sm font-medium text-accent transition-colors hover:text-accent-hover sm:block"
            >
              All news &rarr;
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {articles.slice(0, 4).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link
              to="/news"
              className="inline-block rounded-xl border border-border px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-elevated"
            >
              All news &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
