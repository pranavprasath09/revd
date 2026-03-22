import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/context/AuthContext";
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
        const results = (data as FeedEvent[]) ?? [];
        setHasMore(results.length === PAGE_SIZE);

        if (offset === 0) {
          setEvents(results);
        } else {
          setEvents((prev) => [...prev, ...results]);
        }
        return results;
      } catch (err) {
        console.error("Failed to fetch feed:", (err as Error).message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // ─── Create feed events for all followers ───────────────────
  const createFeedEvent = useCallback(
    async (params: {
      eventType: string;
      entityType?: string;
      entityId?: string;
      metadata?: Record<string, unknown>;
    }) => {
      if (!user) return;

      try {
        // Get all followers of the current user
        const { data: followers, error: followError } = await supabase
          .from("follows")
          .select("follower_id")
          .eq("following_id", user.id);

        if (followError) throw followError;
        if (!followers || followers.length === 0) return;

        // Create feed event for each follower
        const feedEntries = followers.map((f) => ({
          user_id: f.follower_id,
          actor_id: user.id,
          event_type: params.eventType,
          entity_type: params.entityType ?? null,
          entity_id: params.entityId ?? null,
          metadata: params.metadata ?? null,
        }));

        await supabase.from("feed_events").insert(feedEntries);
      } catch (err) {
        // Non-blocking
        console.error("Failed to create feed events:", (err as Error).message);
      }
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
