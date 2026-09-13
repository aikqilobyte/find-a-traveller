import { NextResponse } from "next/server";

// Stripe-ready stub. Inactive until STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET
// are configured — see src/lib/payments/index.ts for the full swap-in plan.
// Once configured: verify the signature with `stripe.webhooks.constructEvent`
// using the raw request body and STRIPE_WEBHOOK_SECRET, then on
// `payment_intent.succeeded` use lib/supabase/admin.ts (service role — a
// webhook has no user session) to set payments.status = 'paid' and advance
// the booking to 'pickup_pending', mirroring confirm_test_payment().
export async function POST() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe is not configured in this environment. See .env.example." },
      { status: 501 },
    );
  }

  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
