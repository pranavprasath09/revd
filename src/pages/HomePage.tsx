import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import AnimatedHero from "@/components/ui/AnimatedHero";
import CarCard from "@/components/cars/CarCard";
import ArticleCard from "@/components/news/ArticleCard";
import carsData from "@/data/cars.json";
import { useNews } from "@/hooks/useNews";
import type { Car } from "@/types/car";

const cars = carsData as Car[];

const CTA_BG = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80";

/* ── Scroll-reveal hook ─────────────────────────────── */
function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

/* ── Animated counter ───────────────────────────────── */
function AnimatedCounter({ target, suffix = "", visible }: { target: number; suffix?: string; visible: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [visible, target]);

  return <>{count}{suffix}</>;
}

/* ── Stats data ─────────────────────────────────────── */
const STATS = [
  { target: 30, suffix: "+", label: "Cars Profiled" },
  { target: 100, suffix: "+", label: "Mod Guides" },
  { target: 30, suffix: "", label: "Reliability Reports" },
  { target: 0, suffix: "", label: "Free to Start", display: "FREE" },
];

/* ── Home Page ──────────────────────────────────────── */
export default function HomePage() {
  const { articles } = useNews();
  const featuredSection = useScrollReveal<HTMLElement>();
  const statsSection = useScrollReveal<HTMLElement>();
  const newsSection = useScrollReveal<HTMLElement>();
  const ctaSection = useScrollReveal<HTMLElement>();

  return (
    <div>
      <SEOHead
        title="The Modern Automotive Enthusiast Platform"
        description="Research any car, read fresh news, find mod guides, check reliability, and connect with other enthusiasts. All in one place."
      />

      {/* ── Hero ────────────────────────────────────── */}
      <AnimatedHero />

      {/* ── Featured Cars ───────────────────────────── */}
      <section
        ref={featuredSection.ref}
        className="bg-bg-base px-6 py-20 sm:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between">
            <h2
              className={`section-label transition-all duration-700 ease-out ${featuredSection.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              Featured Cars
            </h2>
            <Link
              to="/cars"
              className={`hidden items-center gap-1 font-body text-xs font-bold uppercase tracking-wider text-text-secondary transition-all duration-700 delay-200 hover:text-accent-red sm:inline-flex ${featuredSection.visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            >
              View all
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cars.slice(0, 6).map((car, i) => (
              <div
                key={car.id}
                className={`transition-all duration-700 ease-out ${featuredSection.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                style={{ transitionDelay: featuredSection.visible ? `${i * 100}ms` : "0ms" }}
              >
                <CarCard car={car} index={0} />
              </div>
            ))}
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Link
              to="/cars"
              className="inline-block rounded-lg bg-accent-red px-8 py-3.5 font-display text-lg uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
            >
              View All Cars
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────────── */}
      <section
        ref={statsSection.ref}
        className="border-y border-white/5"
        style={{ background: "#1a0a0a" }}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-white/5 sm:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`px-6 py-10 text-center transition-all duration-700 ease-out ${statsSection.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
              style={{ transitionDelay: statsSection.visible ? `${i * 100}ms` : "0ms" }}
            >
              <p className="font-display text-4xl tracking-tight text-accent-red sm:text-5xl">
                {stat.display ? (
                  stat.display
                ) : (
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} visible={statsSection.visible} />
                )}
              </p>
              <p className="mt-2 font-body text-[11px] font-bold uppercase tracking-widest text-white/40">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Latest News ─────────────────────────────── */}
      <section
        ref={newsSection.ref}
        className="bg-bg-base px-6 py-20 sm:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between">
            <h2
              className={`section-label transition-all duration-700 ease-out ${newsSection.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              Latest News
            </h2>
            <Link
              to="/news"
              className={`hidden items-center gap-1 font-body text-xs font-bold uppercase tracking-wider text-text-secondary transition-all duration-700 delay-200 hover:text-accent-red sm:inline-flex ${newsSection.visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            >
              All news
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {articles.slice(0, 4).map((article, i) => (
              <div
                key={article.id}
                className={`transition-all duration-700 ease-out ${newsSection.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                style={{ transitionDelay: newsSection.visible ? `${i * 100}ms` : "0ms" }}
              >
                <ArticleCard article={article} />
              </div>
            ))}
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Link
              to="/news"
              className="inline-block rounded-lg border border-white/15 px-8 py-3.5 font-display text-lg uppercase tracking-wider text-white transition-colors hover:bg-bg-elevated"
            >
              All News
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA Banner ───────────────────────── */}
      <section
        ref={ctaSection.ref}
        className="relative overflow-hidden"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={CTA_BG}
            alt=""
            className="h-full w-full object-cover opacity-15"
            loading="lazy"
          />
        </div>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-bg-base/80" aria-hidden="true" />

        <div className="relative z-10 px-6 py-24 text-center sm:py-32">
          <h2
            className={`font-display text-5xl uppercase tracking-wide text-white sm:text-6xl lg:text-7xl transition-all duration-700 ease-out ${ctaSection.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            Ready to go deeper?
          </h2>
          <p
            className={`mx-auto mt-4 max-w-lg font-body text-base text-white/40 sm:text-lg transition-all duration-700 ease-out delay-150 ${ctaSection.visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
          >
            Join thousands of enthusiasts. Free forever, premium when you want it.
          </p>
          <div
            className={`mt-8 transition-all duration-700 ease-out delay-300 ${ctaSection.visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
          >
            <Link
              to="/sign-in"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-10 py-4 font-display text-xl uppercase tracking-wider text-white transition-all hover:bg-accent-hover hover:shadow-xl hover:shadow-accent-red/25"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
