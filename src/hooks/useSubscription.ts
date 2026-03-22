import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/context/AuthContext";
import { createCheckoutSession, createPortalSession } from "@/lib/stripe";

interface Subscription {
  plan: string;
  status: string;
  stripe_customer_id: string | null;
  current_period_end: string | null;
}

const PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID ?? "";

export default function useSubscription() {
  const { user, isPremium } = useAuthContext();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch subscription data
  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from("subscriptions")
      .select("plan, status, stripe_customer_id, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error("Failed to fetch subscription:", error.message);
        setSubscription(data as Subscription | null);
        setLoading(false);
      });
  }, [user]);

  // Subscribe — redirect to Stripe Checkout
  const subscribe = useCallback(async (): Promise<{ error?: string }> => {
    if (!user) return { error: "Not signed in" };
    if (!PRICE_ID) return { error: "Stripe price not configured" };

    const { url, error } = await createCheckoutSession(PRICE_ID, user.id);
    if (error || !url) return { error: error ?? "Failed to create checkout session" };

    window.location.href = url;
    return {};
  }, [user]);

  // Manage subscription — redirect to Stripe Portal
  const manageSubscription = useCallback(async (): Promise<{ error?: string }> => {
    if (!subscription?.stripe_customer_id) {
      return { error: "No active subscription found" };
    }

    const { url, error } = await createPortalSession(subscription.stripe_customer_id);
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
