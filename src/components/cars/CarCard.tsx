import { Link } from "react-router-dom";
import type { Car } from "@/types/car";

interface CarCardProps {
  car: Car;
  index?: number;
}

export default function CarCard({ car, index = 0 }: CarCardProps) {
  const topEngine = car.engines[0];

  return (
    <Link
      to={`/cars/${car.make.toLowerCase()}/${car.model.toLowerCase().replace(/\s+/g, "-")}/${car.years.split("–")[0]}`}
      className="card-corner group relative overflow-hidden rounded-xl border border-white/5 bg-bg-surface transition-all duration-300 animate-fade-up hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(230,57,70,0.3)]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image with permanent red gradient */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={car.heroImage}
          alt={`${car.years} ${car.make} ${car.model} ${car.generation}`}
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80"; }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Permanent red gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-accent-red/40 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Tags */}
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {car.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/10 px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-md"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Generation badge — flips to stats on hover */}
        <div className="absolute right-3 top-3" style={{ perspective: "600px" }}>
          <div className="relative transition-transform duration-500 group-hover:[transform:rotateY(180deg)]" style={{ transformStyle: "preserve-3d" }}>
            {/* Front — generation */}
            <div className="rounded-lg bg-accent-red px-3 py-1 font-display text-sm uppercase tracking-wider text-white" style={{ backfaceVisibility: "hidden" }}>
              {car.generation}
            </div>
            {/* Back — quick stats */}
            <div
              className="absolute inset-0 flex items-center rounded-lg bg-bg-base/90 px-3 py-1 backdrop-blur-sm [transform:rotateY(180deg)]"
              style={{ backfaceVisibility: "hidden" }}
            >
              <span className="font-mono text-xs font-bold text-accent-red">{topEngine.power}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display text-2xl uppercase tracking-wide text-text-primary">
          {car.make} {car.model}
        </h3>
        <p className="font-body text-xs font-medium uppercase tracking-wider text-text-muted">
          {car.years}
        </p>

        {/* Stats bar — monospace numbers */}
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
          <div>
            <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Power
            </p>
            <p className="font-mono text-sm font-bold text-text-primary">
              {topEngine.power}
            </p>
          </div>
          <div>
            <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">
              0–100
            </p>
            <p className="font-mono text-sm font-bold text-text-primary">
              {car.performance["0_to_100_kph"]}
            </p>
          </div>
          <div>
            <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Layout
            </p>
            <p className="font-mono text-sm font-bold text-text-primary">
              {car.performance.drivetrain}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom red glow that spreads on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-red opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:shadow-[0_0_20px_4px_rgba(230,57,70,0.4)]" />
    </Link>
  );
}
