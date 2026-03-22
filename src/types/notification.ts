export type NotificationType =
  | "follow"
  | "photo_like"
  | "build_like"
  | "post_upvote"
  | "comment"
  | "meet_rsvp";

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: NotificationType;
  entity_type: string | null;
  entity_id: string | null;
  message: string | null;
  is_read: boolean;
  created_at: string;
  actor?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export type FeedEventType =
  | "new_album"
  | "new_build_entry"
  | "new_meet"
  | "new_post";

export interface FeedEvent {
  id: string;
  user_id: string;
  actor_id: string;
  event_type: FeedEventType;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}
