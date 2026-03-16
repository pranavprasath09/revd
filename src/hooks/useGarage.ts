import { useState, useCallback, useEffect } from "react";
import type { GarageCar, GarageMod } from "@/types/garage";

const STORAGE_KEY = "revd-garage";

function loadGarage(): GarageCar[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GarageCar[];
  } catch {
    return [];
  }
}

function saveGarage(cars: GarageCar[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
}

export default function useGarage() {
  const [cars, setCars] = useState<GarageCar[]>(loadGarage);

  // Sync to localStorage on every change
  useEffect(() => {
    saveGarage(cars);
  }, [cars]);

  const addCar = useCallback((carId: string, nickname?: string, year?: string) => {
    setCars((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        carId,
        nickname: nickname || undefined,
        year: year || undefined,
        notes: "",
        mods: [],
        addedAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const removeCar = useCallback((id: string) => {
    setCars((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateCar = useCallback((id: string, updates: Partial<Pick<GarageCar, "nickname" | "year" | "notes">>) => {
    setCars((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const addMod = useCallback((carId: string, mod: Omit<GarageMod, "id">) => {
    setCars((prev) =>
      prev.map((c) =>
        c.id === carId
          ? { ...c, mods: [...c.mods, { ...mod, id: crypto.randomUUID() }] }
          : c
      )
    );
  }, []);

  const removeMod = useCallback((carId: string, modId: string) => {
    setCars((prev) =>
      prev.map((c) =>
        c.id === carId
          ? { ...c, mods: c.mods.filter((m) => m.id !== modId) }
          : c
      )
    );
  }, []);

  const updateMod = useCallback((carId: string, modId: string, updates: Partial<Omit<GarageMod, "id">>) => {
    setCars((prev) =>
      prev.map((c) =>
        c.id === carId
          ? { ...c, mods: c.mods.map((m) => (m.id === modId ? { ...m, ...updates } : m)) }
          : c
      )
    );
  }, []);

  return { cars, addCar, removeCar, updateCar, addMod, removeMod, updateMod };
}
