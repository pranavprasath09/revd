import { supabase } from "@/lib/supabase";
import type { NotificationType } from "@/types/notification";

/**
 * Direct notification creator for use in hooks.
 * Avoids hook-in-hook dependency by calling supabase directly.
 * Non-blocking — errors are logged but never thrown.
 */
export async function createNotificationDirect(params: {
  actorId: string;
  userId: string;
  type: NotificationType;
  entityType?: string;
  entityId?: string;
  message?: string;
}): Promise<void> {
  // Don't notify yourself
  if (params.userId === params.actorId) return;

  try {
    await supabase.from("notifications").insert({
      user_id: params.userId,
      actor_id: params.actorId,
      type: params.type,
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
      message: params.message ?? null,
    });
  } catch (err) {
    console.error("Failed to create notification:", (err as Error).message);
  }
}

/**
 * Create feed events for all followers of the actor.
 * Non-blocking — errors are logged but never thrown.
 */
export async function createFeedEventDirect(params: {
  actorId: string;
  eventType: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const { data: followers, error } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("following_id", params.actorId);

    if (error) throw error;
    if (!followers || followers.length === 0) return;

    const entries = followers.map((f) => ({
      user_id: f.follower_id,
      actor_id: params.actorId,
      event_type: params.eventType,
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
      metadata: params.metadata ?? null,
    }));

    await supabase.from("feed_events").insert(entries);
  } catch (err) {
    console.error("Failed to create feed events:", (err as Error).message);
  }
}
