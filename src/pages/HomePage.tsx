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

      {/* Animated Hero */}
      <AnimatedHero />

      {/* Stats bar */}
      <section className="border-y border-white/5 bg-bg-surface/50 backdrop-blur-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-white/5 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="px-6 py-6 text-center">
              <p className="text-2xl font-black tracking-tight text-text-primary sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Cars */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-red">
              Collection
            </p>
            <h2 className="mt-1 text-editorial text-2xl font-extrabold text-text-primary sm:text-4xl">
              Featured Cars
            </h2>
          </div>
          <Link
            to="/cars"
            className="hidden items-center gap-1 text-xs font-bold uppercase tracking-wider text-text-secondary transition-colors hover:text-accent-red sm:inline-flex"
          >
            View all
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
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
            className="inline-block rounded-xl bg-accent-red px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            View all cars
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Latest News */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-red">
              Editorial
            </p>
            <h2 className="mt-1 text-editorial text-2xl font-extrabold text-text-primary sm:text-4xl">
              Latest News
            </h2>
          </div>
          <Link
            to="/news"
            className="hidden items-center gap-1 text-xs font-bold uppercase tracking-wider text-text-secondary transition-colors hover:text-accent-red sm:inline-flex"
          >
            All news
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
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
            className="inline-block rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-elevated"
          >
            All news
          </Link>
        </div>
      </section>
    </div>
  );
}
