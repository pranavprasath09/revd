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
      className="group overflow-hidden rounded-xl border border-border bg-bg-surface transition-all hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={car.heroImage}
          alt={`${car.years} ${car.make} ${car.model} ${car.generation}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {car.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold tracking-tight text-text-primary">
          {car.make} {car.model}{" "}
          <span className="text-text-muted">{car.generation}</span>
        </h3>
        <p className="mt-0.5 text-sm text-text-secondary">{car.years}</p>

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
          <div>
            <p className="text-xs text-text-muted">Power</p>
            <p className="text-sm font-semibold text-text-primary">{topEngine.power}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">0–100</p>
            <p className="text-sm font-semibold text-text-primary">{car.performance["0_to_100_kph"]}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Layout</p>
            <p className="text-sm font-semibold text-text-primary">{car.performance.drivetrain}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
