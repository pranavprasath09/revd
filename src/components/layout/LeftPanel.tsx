import { Link } from "react-router-dom";
import carsData from "@/data/cars.json";
import type { Car } from "@/types/car";

const cars = carsData as Car[];

const QUICK_STATS = [
  { label: "Cars in Database", value: "30", icon: "🏎" },
  { label: "Mod Guides", value: "100+", icon: "🔧" },
  { label: "Community Members", value: "2.4K", icon: "👥" },
];

const TOP_SEARCHED = [
  { term: "BMW E46", count: "1.2K" },
  { term: "Supra A80", count: "980" },
  { term: "Skyline R34", count: "870" },
  { term: "MX-5 Miata", count: "750" },
  { term: "Civic Type R", count: "620" },
];

// Pick a random featured car
const FEATURED_CAR = cars.find((c) => c.slug === "nissan-skyline-gtr-r34") ?? cars[0];

export default function LeftPanel() {
  return (
    <div className="sticky top-6 hidden w-[280px] shrink-0 space-y-6 2xl:block">
      {/* Quick Stats */}
      <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
        <h3 className="font-display text-lg uppercase tracking-wider text-white">
          <span className="text-accent-red">//</span> Quick Stats
        </h3>
        <div className="mt-4 space-y-3">
          {QUICK_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2.5"
            >
              <span className="font-body text-xs font-medium text-text-secondary">
                {stat.label}
              </span>
              <span className="font-mono text-sm font-bold text-accent-red">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Searched */}
      <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
        <h3 className="font-display text-lg uppercase tracking-wider text-white">
          <span className="text-accent-red">//</span> Top Searched
        </h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {TOP_SEARCHED.map((item) => (
            <Link
              key={item.term}
              to="/cars"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-body text-xs font-medium text-text-secondary transition-all hover:border-accent-red/30 hover:bg-accent-red/10 hover:text-white"
            >
              {item.term}
              <span className="font-mono text-[10px] text-accent-red/60">{item.count}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Build of the Week */}
      <div className="overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]">
        <div className="p-5 pb-3">
          <h3 className="font-display text-lg uppercase tracking-wider text-white">
            <span className="text-accent-red">//</span> Build of the Week
          </h3>
        </div>
        <Link
          to={`/cars/${FEATURED_CAR.make.toLowerCase()}/${FEATURED_CAR.model.toLowerCase().replace(/\s+/g, "-")}/${FEATURED_CAR.years.split("–")[0]}`}
          className="group block"
        >
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={FEATURED_CAR.heroImage}
              alt={`${FEATURED_CAR.make} ${FEATURED_CAR.model}`}
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80"; }}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
          </div>
          <div className="px-5 pb-5 pt-3">
            <p className="font-display text-xl uppercase tracking-wide text-white group-hover:text-accent-red transition-colors">
              {FEATURED_CAR.make} {FEATURED_CAR.model} {FEATURED_CAR.generation}
            </p>
            <div className="mt-2 flex items-center gap-3">
              {/* Owner avatar placeholder */}
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#242424] border border-[#2a2a2a]">
                <span className="font-body text-[10px] font-bold text-text-muted">JT</span>
              </div>
              <span className="font-body text-xs text-text-secondary">by <span className="font-semibold text-text-primary">@jt_builds</span></span>
            </div>
            <div className="mt-2 flex gap-3">
              <span className="font-mono text-[11px] text-accent-red">12 mods</span>
              <span className="font-mono text-[11px] text-text-muted">·</span>
              <span className="font-mono text-[11px] text-text-muted">Stage 2+</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
