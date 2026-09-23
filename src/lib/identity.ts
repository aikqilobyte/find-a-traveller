import type { BookingStatus, PaymentStatus } from "@/lib/types/database";

/**
 * Counterparties stay anonymous to each other until the booking is paid
 * for. Before that, both sides see a rating and country only — enough to
 * judge trustworthiness, not enough to take the deal off-platform or to
 * identify someone who hasn't committed to anything yet.
 *
 * Source of truth is the payment: a `paid` row in `payments`. Booking
 * status is checked too, because every state after payment implies the
 * money went through (and a later refund shouldn't re-hide a name the
 * other party has already seen).
 */
const REVEALED_AFTER: BookingStatus[] = [
  "paid",
  "pickup_pending",
  "pickup_confirmed",
  "in_transit",
  "delivery_pending",
  "otp_pending",
  "delivered",
  "completed",
  "disputed",
];

export function isIdentityRevealed(input: {
  bookingStatus?: BookingStatus | null;
  paymentStatuses?: (PaymentStatus | null | undefined)[];
}): boolean {
  if (input.paymentStatuses?.some((status) => status === "paid")) return true;
  if (input.bookingStatus && REVEALED_AFTER.includes(input.bookingStatus)) return true;
  return false;
}
