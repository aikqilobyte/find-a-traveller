// Client-side mirror of the `calculate_fees` Postgres function
// (supabase/migrations/20260101000002_functions.sql) — used ONLY to show
// shoppers an estimate before they submit a request. The database
// function is the sole authority: every booking's stored fee amounts are
// computed server-side inside the same transaction that creates or
// updates it, so a manipulated client estimate can never change what a
// user is actually charged.

const SERVICE_FEE_RATE = 0.08;
const PLATFORM_FEE_RATE = 0.02;
const PLATFORM_FEE_MIN_CENTS = 100;

export interface FeeBreakdown {
  itemPriceCents: number;
  serviceFeeCents: number;
  platformFeeCents: number;
  totalCents: number;
}

export function estimateFees(itemPriceCents: number): FeeBreakdown {
  const serviceFeeCents = Math.round(itemPriceCents * SERVICE_FEE_RATE);
  const platformFeeCents = Math.max(Math.round(itemPriceCents * PLATFORM_FEE_RATE), PLATFORM_FEE_MIN_CENTS);
  return {
    itemPriceCents,
    serviceFeeCents,
    platformFeeCents,
    totalCents: itemPriceCents + serviceFeeCents + platformFeeCents,
  };
}
