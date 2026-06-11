export interface CarEngine {
  code: string;
  displacement: string;
  configuration: string;
  power: string;
  torque: string;
  variants: string[];
}

export type TrimTier = "base" | "mid" | "performance" | "flagship";

export interface CarTrim {
  id: string;
  name: string;
  tier: TrimTier;
  yearsOffered: string;
  engine: string;
  power: string;
  torque: string;
  zeroTo100: string;
  topSpeedKph: number;
  weightKg: number;
  drivetrain: string;
  transmission: string;
  highlights: string[];
  funFact?: string;
  /** Optional trim-specific photo (official press image URL). Falls back to the car's heroImage. */
  image?: string;
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
  trims?: CarTrim[];
}
