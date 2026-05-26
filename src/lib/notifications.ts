import { supabase } from "@/lib/supabase";

/**
 * Notify a user about a follow action via SECURITY DEFINER RPC.
 * Non-blocking — errors are logged but never thrown.
 */
export async function notifyOnFollow(targetUserId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc("notify_on_follow", {
      target_user_id: targetUserId,
    });
    if (error) throw error;
  } catch (err) {
    if (import.meta.env.DEV) console.error("Failed to create follow notification:", (err as Error).message);
  }
}

/**
 * Notify a post author about a comment via SECURITY DEFINER RPC.
 * Non-blocking — errors are logged but never thrown.
 */
export async function notifyOnComment(postId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc("notify_on_comment", {
      p_post_id: postId,
    });
    if (error) throw error;
  } catch (err) {
    if (import.meta.env.DEV) console.error("Failed to create comment notification:", (err as Error).message);
  }
}

/**
 * Notify a build log owner about a like via SECURITY DEFINER RPC.
 * Non-blocking — errors are logged but never thrown.
 */
export async function notifyOnBuildLike(buildLogId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc("notify_on_build_like", {
      p_build_log_id: buildLogId,
    });
    if (error) throw error;
  } catch (err) {
    if (import.meta.env.DEV) console.error("Failed to create build_like notification:", (err as Error).message);
  }
}

/**
 * Create feed events for all followers of the current user via SECURITY DEFINER RPC.
 * Non-blocking — errors are logged but never thrown.
 */
export async function emitFeedEvent(params: {
  eventType: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const { error } = await supabase.rpc("emit_feed_event", {
      p_event_type: params.eventType,
      p_entity_type: params.entityType ?? null,
      p_entity_id: params.entityId ?? null,
      p_metadata: params.metadata ?? null,
    });
    if (error) throw error;
  } catch (err) {
    if (import.meta.env.DEV) console.error("Failed to emit feed event:", (err as Error).message);
  }
}
