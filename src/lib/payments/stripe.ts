import "server-only";
import Stripe from "stripe";

/**
 * The Stripe client, or null when no key is configured.
 *
 * Returning null rather than throwing lets the app fall back to the
 * built-in test flow, so a developer without keys still gets a working
 * booking path end to end.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
