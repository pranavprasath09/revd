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
    .maybeSingle();
  return data?.tier === "premium" ? "premium" : "free";
}

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // True once the profile tier has actually been fetched — premium gates
  // should wait for this instead of treating the placeholder "free" as truth.
  const [tierLoaded, setTierLoaded] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const mapped = mapSupabaseUser(session.user);
        // Preserve the already-resolved tier across token refreshes — mapped
        // hardcodes "free", and flashing a premium user down to free slams the
        // paywall in their face for a second every TOKEN_REFRESHED event.
        setUser((prev) =>
          prev?.id === mapped.id ? { ...mapped, tier: prev.tier } : mapped
        );
        fetchTier(session.user.id).then((tier) => {
          setUser((prev) => (prev?.id === mapped.id ? { ...prev, tier } : prev));
          setTierLoaded(true);
        });
      } else {
        setUser(null);
        setTierLoaded(true);
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
      password: string,
      displayName?: string
    ): Promise<{ success: boolean; error?: string }> => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: displayName
          ? { data: { display_name: displayName } }
          : undefined,
      });
      if (error) return { success: false, error: error.message };

      // The profile row is created server-side by the handle_new_user trigger on
      // auth.users (migration 011). That works under email confirmation too, where
      // no client session exists yet — so we no longer upsert from the client.
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
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch (err) {
      console.error("Failed to sign out:", (err as Error).message);
    }
    setUser(null);
  }, []);

  const resetPassword = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    },
    []
  );

  const updatePassword = useCallback(
    async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
      return { success: true };
    },
    []
  );

  const isPremium = useMemo(() => user?.tier === "premium", [user]);
  const isSignedIn = useMemo(() => user !== null, [user]);

  return {
    user,
    loading,
    tierLoaded,
    isSignedIn,
    isPremium,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
  };
}
