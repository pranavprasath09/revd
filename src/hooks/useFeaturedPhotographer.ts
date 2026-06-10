import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface FeaturedPhotographer {
  profile_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  follower_count: number;
  album_count: number;
  recent_covers: string[];
}

/**
 * Fetches the algorithmically featured photographer (Sprint 8) via the
 * get_featured_photographer RPC: most-followed profile with at least one
 * public album. Returns null while loading or when no photographer exists.
 */
export default function useFeaturedPhotographer() {
  const [featured, setFeatured] = useState<FeaturedPhotographer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    supabase
      .rpc("get_featured_photographer")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          if (import.meta.env.DEV) console.error("Failed to fetch featured photographer:", error.message);
          setLoading(false);
          return;
        }
        const row = Array.isArray(data) ? data[0] : data;
        setFeatured((row as FeaturedPhotographer | undefined) ?? null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { featured, loading };
}
