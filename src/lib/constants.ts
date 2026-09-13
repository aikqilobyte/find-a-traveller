export const TRANSPORT_TYPES = [
  { value: "plane", label: "Plane" },
  { value: "train", label: "Train" },
  { value: "bus", label: "Bus" },
  { value: "car", label: "Car" },
] as const;

export const TRIP_TYPES = [
  { value: "one_way", label: "One Way" },
  { value: "round_way", label: "Round Way" },
] as const;

export const CATEGORY_FALLBACK = [
  "Documents",
  "Books",
  "Clothing",
  "Electronics",
  "Luxury",
  "Gifts",
  "Other",
] as const;

export const ITEM_CONDITIONS = [
  { value: "excellent", label: "Excellent — Like New" },
  { value: "good", label: "Good — Minor Wear" },
  { value: "fair", label: "Fair — Noticeable Wear" },
  { value: "damaged", label: "Damaged — Visible Damage" },
] as const;

export const COUNTRIES = [
  "Bangladesh",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Canada",
  "India",
  "Pakistan",
  "Saudi Arabia",
  "Malaysia",
  "Singapore",
] as const;

export const DEFAULT_CURRENCY = "USD";

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  requested: "Requested",
  offer_pending: "Offer Pending",
  accepted: "Accepted",
  payment_pending: "Payment Pending",
  paid: "Paid",
  pickup_pending: "Awaiting Pickup",
  pickup_confirmed: "Pickup Confirmed",
  in_transit: "In Transit",
  delivery_pending: "Delivery Pending",
  otp_pending: "Awaiting OTP",
  delivered: "Delivered",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
  expired: "Expired",
  disputed: "Disputed",
};

export const STATUS_TONE: Record<string, "success" | "warning" | "error" | "info" | "pending"> = {
  requested: "info",
  offer_pending: "pending",
  accepted: "info",
  payment_pending: "warning",
  paid: "success",
  pickup_pending: "warning",
  pickup_confirmed: "info",
  in_transit: "info",
  delivery_pending: "warning",
  otp_pending: "warning",
  delivered: "success",
  completed: "success",
  rejected: "error",
  cancelled: "error",
  expired: "error",
  disputed: "error",
  active: "success",
  draft: "pending",
  paused: "warning",
  fully_booked: "info",
  offer_received: "pending",
  in_progress: "info",
};
