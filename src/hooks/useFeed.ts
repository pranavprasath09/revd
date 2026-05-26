import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/context/AuthContext";
import { emitFeedEvent } from "@/lib/notifications";
import type { FeedEvent } from "@/types/notification";

const FEED_COLUMNS =
  "id, user_id, actor_id, event_type, entity_type, entity_id, metadata, created_at";
const PAGE_SIZE = 20;

export default function useFeed() {
  const { user } = useAuthContext();
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // ─── Fetch feed events for current user ─────────────────────
  const fetchFeed = useCallback(
    async (offset = 0): Promise<FeedEvent[]> => {
      if (!user) return [];
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("feed_events")
          .select(`${FEED_COLUMNS}, actor:profiles!feed_events_actor_id_fkey(display_name, avatar_url)`)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);

        if (error) throw error;
        const results: FeedEvent[] = (
          (data ?? []) as unknown as (Omit<FeedEvent, "actor"> & {
            actor:
              | { display_name: string | null; avatar_url: string | null }
              | { display_name: string | null; avatar_url: string | null }[]
              | null;
          })[]
        ).map((e) => ({
          ...e,
          actor: Array.isArray(e.actor)
            ? e.actor[0] ?? { display_name: null, avatar_url: null }
            : e.actor ?? undefined,
        }));
        setHasMore(results.length === PAGE_SIZE);

        if (offset === 0) {
          setEvents(results);
        } else {
          setEvents((prev) => [...prev, ...results]);
        }
        return results;
      } catch (err) {
        if (import.meta.env.DEV) console.error("Failed to fetch feed:", (err as Error).message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // ─── Create feed events for all followers via trusted RPC ───
  const createFeedEvent = useCallback(
    async (params: {
      eventType: string;
      entityType?: string;
      entityId?: string;
      metadata?: Record<string, unknown>;
    }) => {
      if (!user) return;
      await emitFeedEvent(params);
    },
    [user]
  );

  return {
    events,
    loading,
    hasMore,
    fetchFeed,
    createFeedEvent,
  };
}
