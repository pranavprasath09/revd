import { useState, useCallback, useEffect, useMemo } from "react";
import type { User } from "@/types/auth";

const STORAGE_KEY = "revd-auth";

// ─── Test Accounts ─────────────────────────────────────────────
// Use these to sign in instantly during development/testing.
const TEST_ACCOUNTS: Record<string, User> = {
  "pro@revd.com": {
    id: "usr_premium_001",
    email: "pro@revd.com",
    displayName: "Pro Tester",
    tier: "premium",
    avatar: "PT",
  },
  "free@revd.com": {
    id: "usr_free_001",
    email: "free@revd.com",
    displayName: "Free Tester",
    tier: "free",
    avatar: "FT",
  },
};

// Password for both accounts — kept simple for testing
const TEST_PASSWORD = "revd";

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function saveUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export default function useAuth() {
  const [user, setUser] = useState<User | null>(loadUser);

  useEffect(() => {
    saveUser(user);
  }, [user]);

  const signIn = useCallback((email: string, password: string): { success: boolean; error?: string } => {
    const normalizedEmail = email.toLowerCase().trim();
    const account = TEST_ACCOUNTS[normalizedEmail];

    if (!account) {
      return { success: false, error: "No account found with that email." };
    }

    if (password !== TEST_PASSWORD) {
      return { success: false, error: "Incorrect password." };
    }

    setUser(account);
    return { success: true };
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const isPremium = useMemo(() => user?.tier === "premium", [user]);
  const isSignedIn = useMemo(() => user !== null, [user]);

  return { user, isSignedIn, isPremium, signIn, signOut };
}

// Export test accounts info for display on sign-in page
export const TEST_ACCOUNT_INFO = [
  { email: "pro@revd.com", password: "revd", tier: "premium" as const, label: "Premium Member — full access to all content" },
  { email: "free@revd.com", password: "revd", tier: "free" as const, label: "Free Member — premium content is gated" },
];
