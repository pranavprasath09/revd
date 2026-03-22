import { supabase } from "@/lib/supabase";

export const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "";

/**
 * Create a Stripe Checkout session via Supabase Edge Function.
 * Returns the checkout URL to redirect to.
 */
export async function createCheckoutSession(
  priceId: string,
  userId: string
): Promise<{ url: string | null; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId, userId },
    });

    if (error) throw error;
    return { url: data?.url ?? null };
  } catch (err) {
    console.error("Failed to create checkout session:", (err as Error).message);
    return { url: null, error: (err as Error).message };
  }
}

/**
 * Create a Stripe Billing Portal session via Supabase Edge Function.
 * Returns the portal URL to redirect to.
 */
export async function createPortalSession(
  customerId: string
): Promise<{ url: string | null; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("create-portal", {
      body: { customerId },
    });

    if (error) throw error;
    return { url: data?.url ?? null };
  } catch (err) {
    console.error("Failed to create portal session:", (err as Error).message);
    return { url: null, error: (err as Error).message };
  }
}
