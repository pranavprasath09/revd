import { Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import AnimatedHero from "@/components/ui/AnimatedHero";
import CarCard from "@/components/cars/CarCard";
import ArticleCard from "@/components/news/ArticleCard";
import carsData from "@/data/cars.json";
import newsData from "@/data/news.json";
import type { Car } from "@/types/car";
import type { Article } from "@/types/news";

const cars = carsData as Car[];
const articles = newsData as Article[];

const STATS = [
  { value: "30+", label: "Cars" },
  { value: "100+", label: "Mod Guides" },
  { value: "24/7", label: "Fresh News" },
  { value: "Free", label: "To Start" },
];

export default function HomePage() {
  return (
    <div className="page-enter">
      <SEOHead
        title="The Modern Automotive Enthusiast Platform"
        description="Research any car, read fresh news, find mod guides, check reliability, and connect with other enthusiasts. All in one place."
      />

      {/* Animated Hero — full viewport */}
      <AnimatedHero />

      {/* Stats bar */}
      <section className="border-y border-white/5 bg-bg-surface/50 backdrop-blur-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-white/5 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="px-6 py-8 text-center">
              <p className="font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 font-body text-[11px] font-bold uppercase tracking-widest text-text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Cars */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="flex items-end justify-between">
          <h2 className="section-label">Featured Cars</h2>
          <Link
            to="/cars"
            className="hidden items-center gap-1 font-body text-xs font-bold uppercase tracking-wider text-text-secondary transition-colors hover:text-accent-red sm:inline-flex"
          >
            View all
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.slice(0, 6).map((car, i) => (
            <CarCard key={car.id} car={car} index={i} />
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link
            to="/cars"
            className="inline-block rounded-full bg-accent-red px-8 py-3.5 font-display text-lg uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
          >
            View All Cars
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-accent-red/20 to-transparent" />
      </div>

      {/* Latest News */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="flex items-end justify-between">
          <h2 className="section-label">Latest News</h2>
          <Link
            to="/news"
            className="hidden items-center gap-1 font-body text-xs font-bold uppercase tracking-wider text-text-secondary transition-colors hover:text-accent-red sm:inline-flex"
          >
            All news
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {articles.slice(0, 4).map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link
            to="/news"
            className="inline-block rounded-full border border-white/15 px-8 py-3.5 font-display text-lg uppercase tracking-wider text-white transition-colors hover:bg-bg-elevated"
          >
            All News
          </Link>
        </div>
      </section>
    </div>
  );
}
