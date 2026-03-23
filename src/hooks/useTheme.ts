import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/context/AuthContext";
import { DEFAULT_THEME_ID, getThemeById, applyTheme } from "@/lib/themes";

const LOCAL_STORAGE_KEY = "revd-theme";

export function useTheme() {
  const { user, isSignedIn } = useAuthContext();
  const [themeId, setThemeId] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY) ?? DEFAULT_THEME_ID;
  });

  // Apply theme on mount and when themeId changes
  useEffect(() => {
    const theme = getThemeById(themeId);
    applyTheme(theme);
  }, [themeId]);

  // Load user's saved theme from Supabase on sign-in
  useEffect(() => {
    if (!isSignedIn || !user) return;

    async function loadUserTheme() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("theme")
          .eq("id", user!.id)
          .maybeSingle();

        if (!error && data?.theme) {
          setThemeId(data.theme);
          localStorage.setItem(LOCAL_STORAGE_KEY, data.theme);
        }
      } catch {
        // Silently fall back to local theme
      }
    }

    loadUserTheme();
  }, [isSignedIn, user]);

  const setTheme = useCallback(
    async (newThemeId: string) => {
      setThemeId(newThemeId);
      localStorage.setItem(LOCAL_STORAGE_KEY, newThemeId);

      // Persist to Supabase if signed in
      if (isSignedIn && user) {
        try {
          await supabase
            .from("profiles")
            .update({ theme: newThemeId })
            .eq("id", user.id);
        } catch {
          // Local storage is the fallback
        }
      }
    },
    [isSignedIn, user]
  );

  return { themeId, setTheme };
}
