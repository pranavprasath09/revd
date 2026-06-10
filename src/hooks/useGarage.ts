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
  // Stable id — keying effects on the user object refetches the whole garage
  // on every hourly token refresh.
  const userId = user?.id ?? null;
  const [cars, setCars] = useState<GarageCar[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCars = useCallback(async (): Promise<GarageCar[]> => {
    if (!userId) return [];
    const { data, error } = await supabase
      .from("garage_cars")
      .select("id, user_id, car_id, nickname, year, notes, mods, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to load garage:", error.message);
      return [];
    }
    return (data as GarageRow[]).map(rowToCar);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setCars([]);
      setLoading(false);
      return;
    }

    // Ignore flag: a sign-out (or account switch) mid-fetch must not let the
    // stale response repopulate the previous user's garage.
    let stale = false;
    setLoading(true);
    fetchCars().then((result) => {
      if (stale) return;
      setCars(result);
      setLoading(false);
    });

    return () => {
      stale = true;
    };
  }, [userId, fetchCars]);

  // On a failed optimistic write, refetch from the server instead of restoring
  // a whole-array snapshot — the snapshot can resurrect cars deleted by other
  // in-flight operations.
  const rollback = useCallback(async () => {
    setCars(await fetchCars());
  }, [fetchCars]);

  const addCar = useCallback(
    async (carId: string, nickname?: string, year?: string): Promise<string | null> => {
      if (!userId) return "Not signed in";
      const { data, error } = await supabase
        .from("garage_cars")
        .insert({
          user_id: userId,
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
        return error.message;
      }
      setCars((prev) => [...prev, rowToCar(data as GarageRow)]);
      return null;
    },
    [userId]
  );

  const removeCar = useCallback(
    async (id: string): Promise<string | null> => {
      setCars((prev) => prev.filter((c) => c.id !== id));

      const { error } = await supabase
        .from("garage_cars")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Failed to remove car:", error.message);
        await rollback();
        return error.message;
      }
      return null;
    },
    [rollback]
  );

  const updateCar = useCallback(
    async (
      id: string,
      updates: Partial<Pick<GarageCar, "nickname" | "year" | "notes">>
    ): Promise<string | null> => {
      setCars((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );

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
        await rollback();
        return error.message;
      }
      return null;
    },
    [rollback]
  );

  const addMod = useCallback(
    async (carId: string, mod: Omit<GarageMod, "id">): Promise<string | null> => {
      const car = cars.find((c) => c.id === carId);
      if (!car) return "Car not found";

      const newMod = { ...mod, id: crypto.randomUUID() };
      const newMods = [...car.mods, newMod];
      setCars((prev) =>
        prev.map((c) => (c.id === carId ? { ...c, mods: newMods } : c))
      );

      const { error } = await supabase
        .from("garage_cars")
        .update({ mods: newMods })
        .eq("id", carId);

      if (error) {
        console.error("Failed to add mod:", error.message);
        await rollback();
        return error.message;
      }
      return null;
    },
    [cars, rollback]
  );

  const removeMod = useCallback(
    async (carId: string, modId: string): Promise<string | null> => {
      const car = cars.find((c) => c.id === carId);
      if (!car) return "Car not found";

      const newMods = car.mods.filter((m) => m.id !== modId);
      setCars((prev) =>
        prev.map((c) => (c.id === carId ? { ...c, mods: newMods } : c))
      );

      const { error } = await supabase
        .from("garage_cars")
        .update({ mods: newMods })
        .eq("id", carId);

      if (error) {
        console.error("Failed to remove mod:", error.message);
        await rollback();
        return error.message;
      }
      return null;
    },
    [cars, rollback]
  );

  const updateMod = useCallback(
    async (
      carId: string,
      modId: string,
      updates: Partial<Omit<GarageMod, "id">>
    ): Promise<string | null> => {
      const car = cars.find((c) => c.id === carId);
      if (!car) return "Car not found";

      const newMods = car.mods.map((m) =>
        m.id === modId ? { ...m, ...updates } : m
      );
      setCars((prev) =>
        prev.map((c) => (c.id === carId ? { ...c, mods: newMods } : c))
      );

      const { error } = await supabase
        .from("garage_cars")
        .update({ mods: newMods })
        .eq("id", carId);

      if (error) {
        console.error("Failed to update mod:", error.message);
        await rollback();
        return error.message;
      }
      return null;
    },
    [cars, rollback]
  );

  return { cars, loading, addCar, removeCar, updateCar, addMod, removeMod, updateMod };
}
