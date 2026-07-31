import carsJson from "@/data/cars.json";
import type { Car } from "@/types/car";

/** cars.json, typed. The canonical 39-car database. */
export const CARS = carsJson as Car[];

/**
 * A car flattened to the fields the Pit Wall sheets and Margin index read —
 * the same shape the design prototype's data (cars-slim.json) uses.
 */
export interface SheetCar {
  idx: number;
  id: string;
  slug: string;
  make: string;
  model: string;
  /** "Make Model" */
  name: string;
  gen: string;
  years: string;
  /** e.g. "320hp" */
  power: string;
  /** numeric horsepower for sorting */
  pw: number;
  /** e.g. "4.6s" */
  zero: string;
  /** numeric 0–100 seconds for sorting */
  zeroN: number;
  /** drivetrain, e.g. "RWD" */
  dt: string;
  /** kerb weight in kg */
  weight: number;
  /** reliability score 0–100 */
  rel: number;
  /** popularity score 0–100 */
  pop: number;
  /** primary engine code */
  engine: string;
  tags: string[];
  hero: string;
  car: Car;
}

/** Peak power across a car's engines — the headline figure the design shows. */
function peakPower(car: Car): { label: string; hp: number } {
  let best = 0;
  for (const e of car.engines) {
    const hp = parseInt(e.power, 10);
    if (!Number.isNaN(hp) && hp > best) best = hp;
  }
  return { label: best ? `${best}hp` : car.engines[0]?.power ?? "—", hp: best };
}

/** Engine code of the most powerful variant — shown beside the years in kickers. */
function peakEngineCode(car: Car): string {
  let best = car.engines[0];
  for (const e of car.engines) {
    if (parseInt(e.power, 10) > parseInt(best?.power ?? "0", 10)) best = e;
  }
  return best?.code ?? "";
}

export const SHEET_CARS: SheetCar[] = CARS.map((car, idx) => {
  const { label, hp } = peakPower(car);
  return {
    idx,
    id: car.id,
    slug: car.slug,
    make: car.make,
    model: car.model,
    name: `${car.make} ${car.model}`,
    gen: car.generation,
    years: car.years,
    power: label,
    pw: hp,
    zero: car.performance["0_to_100_kph"],
    zeroN: parseFloat(car.performance["0_to_100_kph"]) || 0,
    dt: car.performance.drivetrain,
    weight: car.performance.weight_kg,
    rel: car.reliabilityScore,
    pop: car.popularityScore,
    engine: peakEngineCode(car),
    tags: car.tags,
    hero: car.heroImage,
    car,
  };
});

/** First model year — used to build /cars/:make/:model/:year detail links. */
export function firstYear(car: Car): string {
  return car.years.split("–")[0];
}

/** Same slug convention CarDetailPage uses to resolve its params. */
const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

/** Route to the car's detail page, matching /cars/:make/:model/:year. */
export function carPath(car: Car): string {
  return `/cars/${slugify(car.make)}/${slugify(car.model)}/${firstYear(car)}`;
}

export function findSheetCar(id: string): SheetCar | undefined {
  return SHEET_CARS.find((c) => c.id === id || c.slug === id);
}

/** Format a number as money for ledgers and total rows. */
export const money = (n: number) => "$" + n.toLocaleString();
