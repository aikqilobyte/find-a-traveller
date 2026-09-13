// Maps error codes raised by our Postgres functions (supabase/migrations/
// 20260101000002_functions.sql) to plain-language messages. Never surface
// raw database errors to the user.
const MESSAGES: Record<string, string> = {
  unauthorized: "Please sign in to continue.",
  forbidden: "You don't have permission to do that.",
  post_not_found: "This listing no longer exists.",
  post_not_bookable: "This listing isn't accepting bookings right now.",
  post_expired: "This traveller's trip has already departed.",
  insufficient_capacity: "There isn't enough available space left for this weight.",
  cannot_book_own_post: "You can't book your own listing.",
  request_not_open: "This request is no longer open for offers.",
  cannot_offer_own_request: "You can't make an offer on your own request.",
  booking_not_found: "This booking no longer exists.",
  booking_not_negotiable: "This booking can no longer be negotiated.",
  not_your_turn: "Waiting on the other party to respond first.",
  offer_not_pending: "This offer has already been responded to.",
  cannot_accept_own_offer: "You can't accept your own offer.",
  cannot_cancel_in_current_state: "This booking can no longer be cancelled.",
  booking_not_payable: "This booking isn't ready for payment.",
  payment_not_pending: "This payment has already been processed.",
  invalid_state_for_pickup: "This order isn't ready for pickup confirmation.",
  invalid_state_for_transit: "This order isn't ready to start transit.",
  invalid_state_for_delivery: "This order isn't ready for delivery.",
  invalid_state_for_otp: "This order isn't ready to send a delivery code.",
  invalid_state_for_otp_verification: "This order isn't awaiting a delivery code.",
  otp_not_found: "No delivery code was found for this order.",
  otp_expired: "This delivery code has expired. Send a new one.",
  otp_locked: "Too many incorrect attempts. Send a new delivery code.",
  otp_incorrect: "That code is incorrect. Please try again.",
  invalid_rating: "Rating must be between 1 and 5.",
  booking_not_completed: "You can only review completed orders.",
  invalid_reviewee: "Invalid reviewee for this booking.",
  invalid_target_status: "That status change isn't allowed.",
};

export function friendlyError(message: string): string {
  return MESSAGES[message] ?? "Something went wrong. Please try again.";
}
