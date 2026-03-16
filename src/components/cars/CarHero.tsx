import type { Car } from "@/types/car";
import Badge from "@/components/ui/Badge";

interface CarHeroProps {
  car: Car;
}

interface StatItem {
  label: string;
  value: string | number;
  unit?: string;
}

export default function CarHero({ car }: CarHeroProps) {
  const primaryEngine = car.engines[0];

  const stats: StatItem[] = [
    { label: "Power", value: primaryEngine?.power ?? "N/A" },
    { label: "0-100 km/h", value: car.performance["0_to_100_kph"] },
    {
      label: "Top Speed",
      value: car.performance.top_speed_kph,
      unit: "km/h",
    },
    { label: "Weight", value: car.performance.weight_kg, unit: "kg" },
    { label: "Drivetrain", value: car.performance.drivetrain },
  ];

  return (
    <section className="relative w-full overflow-hidden">
      {/* Hero image */}
      <div className="relative aspect-[21/9] w-full sm:aspect-[2.5/1]">
        <img
          src={car.heroImage}
          alt={`${car.years} ${car.make} ${car.model} ${car.generation}`}
          className="h-full w-full object-cover"
          loading="eager"
          width={1400}
          height={600}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Text overlay */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-20 sm:px-10 sm:pb-24">
          <Badge variant="tag" className="mb-3">
            {car.generation}
          </Badge>

          <h1 className="text-editorial text-3xl font-black text-white sm:text-5xl lg:text-6xl">
            {car.years} {car.make} {car.model}
          </h1>
        </div>
      </div>

      {/* Stats bar */}
      <div className="relative z-10 mx-4 -mt-10 rounded-xl border border-border/50 bg-bg-surface/80 px-4 py-4 shadow-2xl shadow-black/30 backdrop-blur-md sm:mx-8 sm:px-8 sm:py-5 lg:mx-auto lg:max-w-5xl">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:flex lg:items-center lg:justify-between lg:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                {stat.label}
              </span>
              <span className="mt-0.5 text-lg font-bold text-text-primary sm:text-xl">
                {stat.value}
                {stat.unit && (
                  <span className="ml-0.5 text-xs font-medium text-text-muted">
                    {stat.unit}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
