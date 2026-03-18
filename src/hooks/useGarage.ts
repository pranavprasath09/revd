import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/context/AuthContext";
import type { GarageCar, GarageMod } from "@/types/garage";

interface GarageRow {
  id: string;
  user_id: string;
  car_id: string;
  nickname: string | null;
  year: string | null;
  notes: string | null;
  mods: GarageMod[];
  created_at: string;
}

function rowToCar(row: GarageRow): GarageCar {
  return {
    id: row.id,
    carId: row.car_id,
    nickname: row.nickname ?? undefined,
    year: row.year ?? undefined,
    notes: row.notes ?? "",
    mods: row.mods ?? [],
    addedAt: row.created_at,
  };
}

export default function useGarage() {
  const { user } = useAuthContext();
  const [cars, setCars] = useState<GarageCar[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch garage cars for the signed-in user
  useEffect(() => {
    if (!user) {
      setCars([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from("garage_cars")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load garage:", error.message);
          setCars([]);
        } else {
          setCars((data as GarageRow[]).map(rowToCar));
        }
        setLoading(false);
      });
  }, [user]);

  const addCar = useCallback(
    async (carId: string, nickname?: string, year?: string) => {
      if (!user) return;
      const { data, error } = await supabase
        .from("garage_cars")
        .insert({
          user_id: user.id,
          car_id: carId,
          nickname: nickname ?? null,
          year: year ?? null,
          notes: "",
          mods: [],
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to add car:", error.message);
        return;
      }
      setCars((prev) => [...prev, rowToCar(data as GarageRow)]);
    },
    [user]
  );

  const removeCar = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from("garage_cars")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Failed to remove car:", error.message);
        return;
      }
      setCars((prev) => prev.filter((c) => c.id !== id));
    },
    []
  );

  const updateCar = useCallback(
    async (
      id: string,
      updates: Partial<Pick<GarageCar, "nickname" | "year" | "notes">>
    ) => {
      const row: Record<string, unknown> = {};
      if (updates.nickname !== undefined) row.nickname = updates.nickname;
      if (updates.year !== undefined) row.year = updates.year;
      if (updates.notes !== undefined) row.notes = updates.notes;

      const { error } = await supabase
        .from("garage_cars")
        .update(row)
        .eq("id", id);

      if (error) {
        console.error("Failed to update car:", error.message);
        return;
      }
      setCars((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
    },
    []
  );

  const addMod = useCallback(
    async (carId: string, mod: Omit<GarageMod, "id">) => {
      const car = cars.find((c) => c.id === carId);
      if (!car) return;

      const newMod = { ...mod, id: crypto.randomUUID() };
      const newMods = [...car.mods, newMod];

      const { error } = await supabase
        .from("garage_cars")
        .update({ mods: newMods })
        .eq("id", carId);

      if (error) {
        console.error("Failed to add mod:", error.message);
        return;
      }
      setCars((prev) =>
        prev.map((c) => (c.id === carId ? { ...c, mods: newMods } : c))
      );
    },
    [cars]
  );

  const removeMod = useCallback(
    async (carId: string, modId: string) => {
      const car = cars.find((c) => c.id === carId);
      if (!car) return;

      const newMods = car.mods.filter((m) => m.id !== modId);

      const { error } = await supabase
        .from("garage_cars")
        .update({ mods: newMods })
        .eq("id", carId);

      if (error) {
        console.error("Failed to remove mod:", error.message);
        return;
      }
      setCars((prev) =>
        prev.map((c) => (c.id === carId ? { ...c, mods: newMods } : c))
      );
    },
    [cars]
  );

  const updateMod = useCallback(
    async (
      carId: string,
      modId: string,
      updates: Partial<Omit<GarageMod, "id">>
    ) => {
      const car = cars.find((c) => c.id === carId);
      if (!car) return;

      const newMods = car.mods.map((m) =>
        m.id === modId ? { ...m, ...updates } : m
      );

      const { error } = await supabase
        .from("garage_cars")
        .update({ mods: newMods })
        .eq("id", carId);

      if (error) {
        console.error("Failed to update mod:", error.message);
        return;
      }
      setCars((prev) =>
        prev.map((c) => (c.id === carId ? { ...c, mods: newMods } : c))
      );
    },
    [cars]
  );

  return { cars, loading, addCar, removeCar, updateCar, addMod, removeMod, updateMod };
}
