import { Link } from "react-router-dom";
import type { Car } from "@/types/car";

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const topEngine = car.engines[0];

  return (
    <Link
      to={`/cars/${car.make.toLowerCase()}/${car.model.toLowerCase().replace(/\s+/g, "-")}/${car.years.split("–")[0]}`}
      className="group relative overflow-hidden rounded-xl border border-white/5 bg-bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-accent-red/30 hover:shadow-2xl hover:shadow-accent-red/10"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={car.heroImage}
          alt={`${car.years} ${car.make} ${car.model} ${car.generation}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {car.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4">
        <h3
          className="text-lg font-extrabold tracking-tight text-text-primary"
          style={{ letterSpacing: "-0.03em" }}
        >
          {car.make} {car.model}{" "}
          <span className="font-bold text-accent-red">{car.generation}</span>
        </h3>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-text-muted">
          {car.years}
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Power
            </p>
            <p className="text-sm font-bold tabular-nums text-text-primary">
              {topEngine.power}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              0–100
            </p>
            <p className="text-sm font-bold tabular-nums text-text-primary">
              {car.performance["0_to_100_kph"]}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Layout
            </p>
            <p className="text-sm font-bold text-text-primary">
              {car.performance.drivetrain}
            </p>
          </div>
        </div>
      </div>

      {/* Hover accent glow at bottom edge */}
      <div className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-accent-red via-accent-hover to-accent-red transition-transform duration-300 group-hover:scale-x-100" />
    </Link>
  );
}
