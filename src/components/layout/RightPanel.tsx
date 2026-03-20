import { Link } from "react-router-dom";
import carsData from "@/data/cars.json";
import { useNews } from "@/hooks/useNews";
import type { Car } from "@/types/car";

const cars = carsData as Car[];

const TRENDING_CARS = cars
  .sort((a, b) => b.popularityScore - a.popularityScore)
  .slice(0, 5);

function MiniSparkline() {
  // Decorative SVG sparkline
  const points = [4, 8, 6, 12, 9, 15, 11, 18, 14, 20];
  const path = points
    .map((y, i) => `${i === 0 ? "M" : "L"}${i * 6},${24 - y}`)
    .join(" ");

  return (
    <svg width="54" height="24" viewBox="0 0 54 24" className="shrink-0">
      <path
        d={path}
        fill="none"
        stroke="#e63946"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RightPanel() {
  const { articles } = useNews();
  const latestArticles = articles.slice(0, 2);

  return (
    <div className="sticky top-6 hidden w-[280px] shrink-0 space-y-6 xl:block">
      {/* Trending Now */}
      <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
        <h3 className="font-display text-lg uppercase tracking-wider text-white">
          <span className="text-accent-red">//</span> Trending Now
        </h3>
        <ul className="mt-4 space-y-3">
          {TRENDING_CARS.map((car, i) => (
            <li key={car.id}>
              <Link
                to={`/cars/${car.make.toLowerCase()}/${car.model.toLowerCase().replace(/\s+/g, "-")}/${car.years.split("–")[0]}`}
                className="group flex items-center gap-3 rounded-lg p-1.5 -mx-1.5 transition-colors hover:bg-white/5"
              >
                <span className="font-display text-2xl leading-none text-accent-red/60 w-7 text-right">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-body text-sm font-semibold text-text-primary truncate group-hover:text-white">
                    {car.make} {car.model}
                  </p>
                  <p className="font-mono text-[10px] text-text-muted">
                    {car.generation} · {car.engines[0].power}
                  </p>
                </div>
                <MiniSparkline />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Latest Drop */}
      <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
        <h3 className="font-display text-lg uppercase tracking-wider text-white">
          <span className="text-accent-red">//</span> Latest Drop
        </h3>
        <div className="mt-4 space-y-3">
          {latestArticles.map((article) => (
            <Link
              key={article.id}
              to={`/news/${article.slug}`}
              className="group block rounded-lg p-2 -mx-2 transition-colors hover:bg-white/5"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="rounded-full bg-accent-red/10 px-2 py-0.5 font-body text-[9px] font-bold uppercase tracking-wider text-accent-red">
                  {article.category}
                </span>
                <span className="font-mono text-[10px] text-text-muted">
                  {timeAgo(article.publishedAt)}
                </span>
              </div>
              <p className="font-body text-sm font-medium leading-snug text-text-secondary line-clamp-2 group-hover:text-white">
                {article.title}
              </p>
            </Link>
          ))}
        </div>
        <Link
          to="/news"
          className="mt-3 block font-body text-xs font-bold uppercase tracking-wider text-accent-red transition-colors hover:text-accent-hover"
        >
          View all news →
        </Link>
      </div>
    </div>
  );
}
