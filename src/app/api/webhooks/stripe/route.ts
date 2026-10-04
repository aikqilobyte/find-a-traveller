import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/payments/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Stripe's callback. This is what actually settles a payment, so a booking
 * only advances because Stripe said the money arrived — never because a
 * browser came back from checkout. A success_url can be visited by anyone
 * who knows it; a signed webhook cannot be forged.
 *
 * Returns 200 on anything we have already handled or do not care about.
 * Stripe retries non-2xx responses, so a 500 for an event we are simply
 * ignoring would have it redelivered for days.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  // The raw body is required: the signature covers the exact bytes Stripe
  // sent, so parsing it first would invalidate the check.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("[stripe] signature verification failed", error);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Only a session Stripe considers settled may advance a booking.
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const paymentId = session.metadata?.payment_id;
  if (!paymentId) {
    console.error("[stripe] session without payment_id", session.id);
    return NextResponse.json({ received: true });
  }

  const reference =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? session.id);

  const admin = createAdminClient();
  const { error } = await admin.rpc("confirm_stripe_payment", {
    p_payment_id: paymentId,
    p_reference: reference,
  });

  if (error) {
    // A genuine failure: let Stripe retry rather than losing the payment.
    console.error("[stripe] settling payment failed", paymentId, error.message);
    return NextResponse.json({ error: "settle_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
