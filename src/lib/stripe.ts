import { supabase } from "@/lib/supabase";

export const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "";

/**
 * Create a Stripe Checkout session via Supabase Edge Function.
 * The edge function derives userId from the JWT — no client-supplied identifiers.
 */
export async function createCheckoutSession(
  priceId: string
): Promise<{ url: string | null; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId },
    });

    if (error) throw error;
    return { url: data?.url ?? null };
  } catch (err) {
    if (import.meta.env.DEV) console.error("Failed to create checkout session:", (err as Error).message);
    return { url: null, error: (err as Error).message };
  }
}

/**
 * Create a Stripe Billing Portal session via Supabase Edge Function.
 * The edge function derives customerId from the DB via JWT — no client-supplied identifiers.
 */
export async function createPortalSession(): Promise<{ url: string | null; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("create-portal", {
      body: {},
    });

    if (error) throw error;
    return { url: data?.url ?? null };
  } catch (err) {
    if (import.meta.env.DEV) console.error("Failed to create portal session:", (err as Error).message);
    return { url: null, error: (err as Error).message };
  }
}
