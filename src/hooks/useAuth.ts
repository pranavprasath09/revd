import { useState, useCallback, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types/auth";
import type { User as SupabaseUser } from "@supabase/supabase-js";

function mapSupabaseUser(su: SupabaseUser): User {
  const meta = su.user_metadata ?? {};
  return {
    id: su.id,
    email: su.email ?? "",
    displayName:
      meta.display_name ?? meta.full_name ?? su.email?.split("@")[0] ?? "",
    tier: "free",
    avatar: meta.avatar_url ?? undefined,
  };
}

async function fetchTier(userId: string): Promise<"free" | "premium"> {
  const { data } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", userId)
    .single();
  return data?.tier === "premium" ? "premium" : "free";
}

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const mapped = mapSupabaseUser(session.user);
        setUser(mapped);
        fetchTier(session.user.id).then((tier) => {
          setUser((prev) => (prev?.id === mapped.id ? { ...prev, tier } : prev));
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Trigger INITIAL_SESSION event if it was missed
    supabase.auth.getSession();

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const isPremium = useMemo(() => user?.tier === "premium", [user]);
  const isSignedIn = useMemo(() => user !== null, [user]);

  return {
    user,
    loading,
    isSignedIn,
    isPremium,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };
}
