"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { friendlyError } from "@/lib/actions/errors";
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
