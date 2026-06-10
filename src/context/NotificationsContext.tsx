import { createContext, useContext, type ReactNode } from "react";
import useNotifications from "@/hooks/useNotifications";

type NotificationsValue = ReturnType<typeof useNotifications>;

const NotificationsContext = createContext<NotificationsValue | null>(null);

/**
 * Single shared notifications subscription. The sidebar mounts two
 * NotificationBell instances (mobile bar + desktop rail, toggled via CSS);
 * each calling useNotifications directly held its own realtime channel and
 * duplicate unread-count queries. One provider = one channel per user.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const value = useNotifications();
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook intentionally colocated with its provider; HMR-only warning
export function useNotificationsContext(): NotificationsValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error("useNotificationsContext must be used within NotificationsProvider");
  return ctx;
}
