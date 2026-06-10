import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/context/AuthContext";
import type { Notification } from "@/types/notification";

const NOTIFICATION_COLUMNS =
  "id, user_id, actor_id, type, entity_type, entity_id, message, is_read, created_at";
const PAGE_SIZE = 20;

export default function useNotifications() {
  const { user } = useAuthContext();
  // Key everything off the stable id, not the user object — auth token
  // refreshes create a new user object every hour, and depending on it tore
  // down and resubscribed the realtime channel (dropping notifications that
  // arrived in the gap).
  const userId = user?.id ?? null;
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // ─── Fetch unread count ─────────────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;
    try {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
      setUnreadCount(count ?? 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", (err as Error).message);
    }
  }, [userId]);

  // ─── Fetch paginated notifications ──────────────────────────
  const fetchNotifications = useCallback(
    async (offset = 0): Promise<Notification[]> => {
      if (!userId) return [];
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select(`${NOTIFICATION_COLUMNS}, actor:profiles!notifications_actor_id_fkey(display_name, avatar_url)`)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);

        if (error) throw error;
        const results: Notification[] = (
          (data ?? []) as unknown as (Omit<Notification, "actor"> & {
            actor:
              | { display_name: string | null; avatar_url: string | null }
              | { display_name: string | null; avatar_url: string | null }[]
              | null;
          })[]
        ).map((n) => ({
          ...n,
          actor: Array.isArray(n.actor)
            ? n.actor[0] ?? { display_name: null, avatar_url: null }
            : n.actor ?? undefined,
        }));
        setHasMore(results.length === PAGE_SIZE);

        if (offset === 0) {
          setNotifications(results);
        } else {
          setNotifications((prev) => [...prev, ...results]);
        }
        return results;
      } catch (err) {
        console.error("Failed to fetch notifications:", (err as Error).message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // ─── Mark single as read ────────────────────────────────────
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId) return;
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", userId);

      // Only mutate local state when the server actually accepted the write —
      // otherwise an offline tap zeroes the badge while rows stay unread.
      if (error) {
        console.error("Failed to mark as read:", error.message);
        return;
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    [userId]
  );

  // ─── Mark all as read ───────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Failed to mark all as read:", error.message);
      return;
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [userId]);

  // ─── Realtime subscription for live count updates ───────────
  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    fetchUnreadCount();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          setUnreadCount((prev) => prev + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchUnreadCount]);

  return {
    unreadCount,
    notifications,
    loading,
    hasMore,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  };
}
