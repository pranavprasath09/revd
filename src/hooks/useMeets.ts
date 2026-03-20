import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/context/AuthContext";
import type { Meet, CreateMeetInput } from "@/types/meet";

export default function useMeets() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const fetchMeets = useCallback(async (): Promise<Meet[]> => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("meets")
        .select("*")
        .gte("date", today)
        .order("date", { ascending: true });

      if (error) throw error;
      return (data as Meet[]) ?? [];
    } catch (err) {
      console.error("Failed to fetch meets:", (err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMeet = useCallback(async (id: string): Promise<Meet | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("meets")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Meet;
    } catch (err) {
      console.error("Failed to fetch meet:", (err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createMeet = useCallback(
    async (input: CreateMeetInput): Promise<Meet | null> => {
      if (!user) return null;
      try {
        const { data, error } = await supabase
          .from("meets")
          .insert({ ...input, creator_id: user.id })
          .select()
          .single();

        if (error) throw error;
        return data as Meet;
      } catch (err) {
        console.error("Failed to create meet:", (err as Error).message);
        return null;
      }
    },
    [user]
  );

  const deleteMeet = useCallback(
    async (meetId: string): Promise<boolean> => {
      if (!user) return false;
      try {
        const { error } = await supabase
          .from("meets")
          .delete()
          .eq("id", meetId)
          .eq("creator_id", user.id);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Failed to delete meet:", (err as Error).message);
        return false;
      }
    },
    [user]
  );

  const rsvpToMeet = useCallback(
    async (meetId: string): Promise<boolean> => {
      if (!user) return false;
      try {
        const { error } = await supabase
          .from("meet_rsvps")
          .insert({ meet_id: meetId, user_id: user.id });

        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Failed to RSVP:", (err as Error).message);
        return false;
      }
    },
    [user]
  );

  const unrsvpFromMeet = useCallback(
    async (meetId: string): Promise<boolean> => {
      if (!user) return false;
      try {
        const { error } = await supabase
          .from("meet_rsvps")
          .delete()
          .eq("meet_id", meetId)
          .eq("user_id", user.id);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Failed to remove RSVP:", (err as Error).message);
        return false;
      }
    },
    [user]
  );

  const getUserRsvps = useCallback(async (): Promise<string[]> => {
    if (!user) return [];
    try {
      const { data, error } = await supabase
        .from("meet_rsvps")
        .select("meet_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return (data ?? []).map((r) => r.meet_id);
    } catch (err) {
      console.error("Failed to fetch RSVPs:", (err as Error).message);
      return [];
    }
  }, [user]);

  return {
    loading,
    fetchMeets,
    fetchMeet,
    createMeet,
    deleteMeet,
    rsvpToMeet,
    unrsvpFromMeet,
    getUserRsvps,
  };
}
