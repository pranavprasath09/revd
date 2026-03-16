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
      <section className="relative overflow-hidden px-4 pb-20 pt-24 sm:pb-28 sm:pt-32">
        {/* Gradient glow behind hero text */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/8 blur-[120px]" />
          <div className="absolute left-1/3 top-1/2 h-[300px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[80px]" />
        </div>

        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            The Enthusiast Platform
          </p>
          <h1 className="text-editorial text-4xl font-black text-text-primary sm:text-6xl md:text-7xl">
            Every car. Every mod.{" "}
            <span className="bg-gradient-to-r from-accent to-red-400 bg-clip-text text-transparent">
              One platform.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
            Specs, reliability, mod guides, and news for the cars you love.
            Built by enthusiasts, for enthusiasts.
          </p>

          <div className="mt-10 w-full sm:mt-12">
            <SearchBar cars={cars} placeholder="Search any car — try 'Supra' or 'BMW E46'" />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-text-muted">
            <span className="text-xs uppercase tracking-wider">Popular:</span>
            {["BMW E46", "Supra A80", "MX-5 Miata"].map((term) => (
              <Link
                key={term}
                to="/cars"
                className="rounded-full border border-border bg-bg-surface/60 px-3 py-1 text-xs font-medium text-text-secondary backdrop-blur-sm transition-all hover:border-accent/40 hover:text-text-primary"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">Collection</p>
            <h2 className="mt-1 text-editorial text-2xl font-extrabold text-text-primary sm:text-4xl">
              Featured Cars
            </h2>
          </div>
          <Link
            to="/cars"
            className="hidden text-xs font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:text-accent sm:block"
          >
            View all &rarr;
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cars.slice(0, 6).map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/cars"
            className="inline-block rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            View all cars &rarr;
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Latest News */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">Editorial</p>
              <h2 className="mt-1 text-editorial text-2xl font-extrabold text-text-primary sm:text-4xl">
                Latest News
              </h2>
            </div>
            <Link
              to="/news"
              className="hidden text-xs font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:text-accent sm:block"
            >
              All news &rarr;
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {articles.slice(0, 4).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
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
