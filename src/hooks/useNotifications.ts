import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/context/AuthContext";
import type { Notification, NotificationType } from "@/types/notification";

const NOTIFICATION_COLUMNS =
  "id, user_id, actor_id, type, entity_type, entity_id, message, is_read, created_at";
const PAGE_SIZE = 20;

export default function useNotifications() {
  const { user } = useAuthContext();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // ─── Fetch unread count ─────────────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
      setUnreadCount(count ?? 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", (err as Error).message);
    }
  }, [user]);

  // ─── Fetch paginated notifications ──────────────────────────
  const fetchNotifications = useCallback(
    async (offset = 0): Promise<Notification[]> => {
      if (!user) return [];
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select(`${NOTIFICATION_COLUMNS}, actor:profiles!notifications_actor_id_fkey(display_name, avatar_url)`)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);

        if (error) throw error;
        const results = ((data ?? []) as unknown as Notification[]).map((n: any) => ({
          ...n,
          actor: Array.isArray(n.actor) ? n.actor[0] ?? { display_name: null, avatar_url: null } : n.actor,
        })) as Notification[];
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
    [user]
  );

  // ─── Mark single as read ────────────────────────────────────
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!user) return;
      try {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notificationId)
          .eq("user_id", user.id);

        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark as read:", (err as Error).message);
      }
    },
    [user]
  );

  // ─── Mark all as read ───────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", (err as Error).message);
    }
  }, [user]);

  // ─── Create a notification ──────────────────────────────────
  const createNotification = useCallback(
    async (params: {
      userId: string;
      type: NotificationType;
      entityType?: string;
      entityId?: string;
      message?: string;
    }) => {
      if (!user) return;
      // Don't notify yourself
      if (params.userId === user.id) return;

      try {
        await supabase.from("notifications").insert({
          user_id: params.userId,
          actor_id: user.id,
          type: params.type,
          entity_type: params.entityType ?? null,
          entity_id: params.entityId ?? null,
          message: params.message ?? null,
        });
      } catch (err) {
        // Non-blocking — don't break the main action
        console.error("Failed to create notification:", (err as Error).message);
      }
    },
    [user]
  );

  // ─── Realtime subscription for live count updates ───────────
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    fetchUnreadCount();

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
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
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchUnreadCount]);

  return {
    unreadCount,
    notifications,
    loading,
    hasMore,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    createNotification,
  };
}
