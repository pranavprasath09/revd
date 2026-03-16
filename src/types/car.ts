export interface CarEngine {
  code: string;
  displacement: string;
  configuration: string;
  power: string;
  torque: string;
  variants: string[];
}

export interface Car {
  id: string;
  make: string;
  model: string;
  generation: string;
  years: string;
  bodyStyles: string[];
  engines: CarEngine[];
  performance: {
    "0_to_100_kph": string;
    top_speed_kph: number;
    weight_kg: number;
    drivetrain: string;
  };
  dimensions: {
    length_mm: number;
    width_mm: number;
    height_mm: number;
    wheelbase_mm: number;
  };
  reliabilityScore: number;
  popularityScore: number;
  tags: string[];
  heroImage: string;
  slug: string;
}
