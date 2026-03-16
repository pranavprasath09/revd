export interface GarageMod {
  id: string;
  name: string;
  description: string;
  cost?: string;
  date?: string;
}

export interface GarageCar {
  id: string;
  carId: string;
  nickname?: string;
  year?: string;
  notes: string;
  mods: GarageMod[];
  addedAt: string;
}
