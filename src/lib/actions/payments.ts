"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { friendlyError } from "@/lib/actions/errors";
import { getStripe } from "@/lib/payments/stripe";
import { getSiteUrl } from "@/lib/site-url";
import { requireProfile } from "@/lib/auth";
import type { Payment } from "@/lib/types/database";

export async function createPaymentIntent(bookingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_payment_intent", { p_booking_id: bookingId });

  if (error) {
    return { error: friendlyError(error.message) } as const;
  }

  return { success: true, payment: data as Payment } as const;
}

// Development/test payment confirmation. There is no real Stripe secret
// key configured in this environment (see .env.example) — this simulates
// a successful charge instead of silently pretending to call Stripe.
// See src/lib/payments/README.md for the Stripe-ready swap-in path.
export async function confirmTestPayment(paymentId: string, bookingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("confirm_test_payment", { p_payment_id: paymentId });

  if (error) {
    return { error: friendlyError(error.message) } as const;
  }

  revalidatePath(`/dashboard/orders/${bookingId}`);
  return { success: true, payment: data as Payment } as const;
}

/**
 * Start paying for a booking.
 *
 * Which provider runs is decided here rather than in the button, so the
 * UI does not need to know whether Stripe is configured — it either gets
 * a URL to send the payer to, or a payment that is already settled.
 *
 * The amount is read from the booking server-side. It is never accepted
 * from the client: a price posted by the browser is a price the browser
 * can change.
 */
export async function startCheckout(bookingId: string) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: intent, error: intentError } = await supabase.rpc("create_payment_intent", {
    p_booking_id: bookingId,
  });
  if (intentError) {
    return { error: friendlyError(intentError.message) } as const;
  }
  const payment = intent as Payment;

  const stripe = getStripe();
  if (!stripe) {
    // No keys configured: fall back to the simulated charge so the rest of
    // the flow stays walkable.
    return confirmTestPayment(payment.id, bookingId);
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("item_description")
    .eq("id", bookingId)
    .single();

  const base = await getSiteUrl();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Stripe takes the smallest currency unit, which is what we already
      // store, so there is no conversion here to get wrong.
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: payment.currency.toLowerCase(),
            unit_amount: payment.amount_cents,
            product_data: {
              name: (booking as { item_description: string } | null)?.item_description ?? "Delivery",
              description: "Held until the package is delivered and the code is confirmed.",
            },
          },
        },
      ],
      customer_email: profile.email ?? undefined,
      // The webhook settles the payment, and this is how it knows which
      // row to settle.
      metadata: { payment_id: payment.id, booking_id: bookingId },
      success_url: `${base}/dashboard/orders/${bookingId}?paid=1`,
      cancel_url: `${base}/dashboard/orders/${bookingId}`,
    });

    if (!session.url) {
      return { error: "Could not start checkout. Please try again." } as const;
    }
    return { success: true, url: session.url } as const;
  } catch (error) {
    console.error("[stripe] checkout session failed", error);
    return { error: "Could not reach the payment provider. Please try again." } as const;
  }
}
