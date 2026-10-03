import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/types/database";

/**
 * What a traveller has earned, grouped by how far along the money is.
 *
 * The traveller receives the item price; the service and platform fees on
 * top are the platform's, so they never appear here. That matches what
 * was agreed in the quote, which is the figure the traveller remembers.
 */

/** Delivered and done — the platform owes this to the traveller. */
const RELEASABLE: BookingStatus[] = ["delivered", "completed"];

/** Paid for, still moving. The money exists but is not theirs yet. */
const IN_ESCROW: BookingStatus[] = [
  "paid",
  "pickup_pending",
  "pickup_confirmed",
  "in_transit",
  "delivery_pending",
  "otp_pending",
];

export interface EarningRow {
  id: string;
  booking_number: string;
  item_description: string;
  status: BookingStatus;
  currency: string;
  item_price_cents: number;
  created_at: string;
}

export interface EarningsSummary {
  releasableCents: number;
  inEscrowCents: number;
  paidOutCents: number;
  currency: string;
  rows: EarningRow[];
}

export async function getTravellerEarnings(travellerId: string): Promise<EarningsSummary> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("bookings")
    .select("id, booking_number, item_description, status, currency, item_price_cents, created_at")
    .eq("traveller_id", travellerId)
    .order("created_at", { ascending: false });

  const rows = (data as EarningRow[]) ?? [];

  let releasableCents = 0;
  let inEscrowCents = 0;

  for (const row of rows) {
    if (RELEASABLE.includes(row.status)) releasableCents += row.item_price_cents;
    else if (IN_ESCROW.includes(row.status)) inEscrowCents += row.item_price_cents;
  }

  return {
    releasableCents,
    inEscrowCents,
    // Nothing has been paid out yet because payouts are not built. Shown
    // as a real zero rather than hidden, so the number has a place to live
    // the day the gateway lands.
    paidOutCents: 0,
    currency: rows[0]?.currency ?? "USD",
    rows: rows.filter((r) => RELEASABLE.includes(r.status) || IN_ESCROW.includes(r.status)),
  };
}
