import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import useNotifications from "@/hooks/useNotifications";
import type { Notification } from "@/types/notification";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function notificationIcon(type: string): string {
  switch (type) {
    case "follow":
      return "followed you";
    case "build_like":
      return "liked your build";
    case "photo_like":
      return "liked your photo";
    case "post_upvote":
      return "upvoted your post";
    case "comment":
      return "commented on your post";
    case "meet_rsvp":
      return "RSVP'd to your meet";
    default:
      return "interacted with you";
  }
}

function getNotificationLink(n: Notification): string | null {
  if (!n.entity_type || !n.entity_id) return null;
  switch (n.entity_type) {
    case "build_log":
      return `/builds/${n.entity_id}`;
    case "album":
      return `/photos/${n.entity_id}`;
    case "post":
      return null; // would need community slug
    case "meet":
      return `/meets/${n.entity_id}`;
    case "profile":
      return null;
    default:
      return null;
  }
}

export default function NotificationBell() {
  const {
    unreadCount,
    notifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleToggle() {
    if (!open && !loaded) {
      fetchNotifications(0);
      setLoaded(true);
    }
    setOpen(!open);
  }

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={handleToggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-surface hover:text-white cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-red px-1 font-mono text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 top-12 z-50 w-80 rounded-xl border border-border bg-bg-surface shadow-2xl md:left-12 md:top-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="font-display text-sm uppercase tracking-wide text-text-primary">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="font-body text-[11px] text-accent-red hover:text-accent-hover transition-colors cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="font-body text-sm text-text-muted">
                  No notifications yet
                </p>
              </div>
            ) : (
              <ul>
                {notifications.map((n) => {
                  const link = getNotificationLink(n);
                  const content = (
                    <div
                      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-bg-elevated ${
                        !n.is_read ? "bg-accent-red/5" : ""
                      }`}
                      onClick={() => {
                        if (!n.is_read) markAsRead(n.id);
                        setOpen(false);
                      }}
                    >
                      {/* Actor avatar */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-elevated border border-border">
                        <span className="font-mono text-xs font-bold text-text-muted">
                          {n.actor?.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-body text-xs text-text-primary leading-relaxed">
                          <span className="font-bold">
                            {n.actor?.display_name ?? "Someone"}
                          </span>{" "}
                          {n.message ?? notificationIcon(n.type)}
                        </p>
                        <p className="font-body text-[10px] text-text-muted mt-0.5">
                          {timeAgo(n.created_at)}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!n.is_read && (
                        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-red" />
                      )}
                    </div>
                  );

                  return link ? (
                    <li key={n.id}>
                      <Link to={link}>{content}</Link>
                    </li>
                  ) : (
                    <li key={n.id} className="cursor-pointer">
                      {content}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
