import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/context/AuthContext";
import { DEFAULT_THEME_ID, getThemeById, applyTheme } from "@/lib/themes";

const LOCAL_STORAGE_KEY = "revd-theme";

export function useTheme() {
  const { user, isSignedIn } = useAuthContext();
  const [themeId, setThemeId] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY) ?? DEFAULT_THEME_ID;
  });
  // An explicit user pick always beats the DB value loading in the background
  const userPickedRef = useRef(false);

  // Apply theme on mount and when themeId changes
  useEffect(() => {
    const theme = getThemeById(themeId);
    applyTheme(theme);
  }, [themeId]);

  // Load user's saved theme from Supabase on sign-in.
  // Keyed on the stable id, with a stale flag so a slow response can't
  // clobber a theme the user picked while the request was in flight.
  const userId = user?.id ?? null;
  useEffect(() => {
    if (!isSignedIn || !userId) return;

    let stale = false;
    async function loadUserTheme() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("theme")
          .eq("id", userId!)
          .maybeSingle();

        if (stale || userPickedRef.current) return;
        if (!error && data?.theme) {
          setThemeId(data.theme);
          localStorage.setItem(LOCAL_STORAGE_KEY, data.theme);
        }
      } catch {
        // Silently fall back to local theme
      }
    }

    loadUserTheme();
    return () => {
      stale = true;
    };
  }, [isSignedIn, userId]);

  const setTheme = useCallback(
    async (newThemeId: string) => {
      userPickedRef.current = true;
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
