import "server-only";
import type { PaymentProvider } from "@/lib/payments/types";

class TestPaymentProvider implements PaymentProvider {
  readonly method = "test_card";
  isConfigured() {
    return true;
  }
}

class StripePaymentProvider implements PaymentProvider {
  readonly method = "stripe";
  isConfigured() {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  }
}

/**
 * Payment provider selection. Defaults to the built-in development/test
 * flow (src/lib/actions/payments.ts -> confirm_test_payment RPC), which
 * simulates a successful charge and is clearly labeled as test mode in
 * the UI (see PaymentSummary / pay page).
 *
 * To go live with Stripe:
 *   1. Set STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET.
 *   2. Replace the "Pay now (test mode)" button's action with a call to
 *      the Stripe SDK (`stripe.paymentIntents.create`) using
 *      booking.total_cents, and redirect to Stripe Checkout or mount
 *      Stripe Elements client-side.
 *   3. Implement src/app/api/webhooks/stripe/route.ts (stub already
 *      present) to verify the webhook signature and, on
 *      `payment_intent.succeeded`, update the `payments` and `bookings`
 *      rows the same way `confirm_test_payment` does — using
 *      lib/supabase/admin.ts since a webhook has no user session.
 * No other application code needs to change: everything downstream
 * (pickup, transit, delivery, OTP, reviews) only depends on
 * `bookings.status` and `payments.status`, not on which provider set them.
 */
export function getPaymentProvider(): PaymentProvider {
  const stripe = new StripePaymentProvider();
  return stripe.isConfigured() ? stripe : new TestPaymentProvider();
}
