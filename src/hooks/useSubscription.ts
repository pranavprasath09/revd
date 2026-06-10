import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/context/AuthContext";
import { createCheckoutSession, createPortalSession } from "@/lib/stripe";

interface Subscription {
  plan: string;
  status: string;
  current_period_end: string | null;
}

const PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID ?? "";

export default function useSubscription() {
  const { user, isPremium } = useAuthContext();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch subscription data (no longer exposes stripe_customer_id to client)
  // Keyed on user.id, not the user object — the object's identity changes on
  // every token refresh. Stale flag stops a sign-out race from restoring the
  // previous user's subscription.
  const userId = user?.id ?? null;
  useEffect(() => {
    if (!userId) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    let stale = false;
    setLoading(true);
    supabase
      .from("subscriptions")
      .select("plan, status, current_period_end")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (stale) return;
        if (error && import.meta.env.DEV) console.error("Failed to fetch subscription:", error.message);
        setSubscription(data as Subscription | null);
        setLoading(false);
      });

    return () => {
      stale = true;
    };
  }, [userId]);

  // Subscribe — redirect to Stripe Checkout (no userId sent)
  const subscribe = useCallback(async (): Promise<{ error?: string }> => {
    if (!user) return { error: "Not signed in" };
    if (!PRICE_ID) return { error: "Stripe price not configured" };

    const { url, error } = await createCheckoutSession(PRICE_ID);
    if (error || !url) return { error: error ?? "Failed to create checkout session" };

    window.location.href = url;
    return {};
  }, [user]);

  // Manage subscription — redirect to Stripe Portal (no customerId sent)
  const manageSubscription = useCallback(async (): Promise<{ error?: string }> => {
    if (!subscription) return { error: "No active subscription found" };

    const { url, error } = await createPortalSession();
    if (error || !url) return { error: error ?? "Failed to open billing portal" };

    window.location.href = url;
    return {};
  }, [subscription]);

  return {
    subscription,
    loading,
    isPremium,
    plan: subscription?.plan ?? "free",
    status: subscription?.status ?? "inactive",
    currentPeriodEnd: subscription?.current_period_end ?? null,
    subscribe,
    manageSubscription,
  };
}
