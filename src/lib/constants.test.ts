import { describe, it, expect } from "vitest";
import { BOOKING_STATUS_LABELS, STATUS_TONE } from "./constants";
import type { BookingStatus } from "./types/database";

const ALL_BOOKING_STATUSES: BookingStatus[] = [
  "requested",
  "offer_pending",
  "accepted",
  "payment_pending",
  "paid",
  "pickup_pending",
  "pickup_confirmed",
  "in_transit",
  "delivery_pending",
  "otp_pending",
  "delivered",
  "completed",
  "rejected",
  "cancelled",
  "expired",
  "disputed",
];

describe("booking status display maps", () => {
  it("has a human label for every booking status", () => {
    for (const status of ALL_BOOKING_STATUSES) {
      expect(BOOKING_STATUS_LABELS[status], `missing label for "${status}"`).toBeTruthy();
    }
  });

  it("has a semantic tone for every booking status", () => {
    for (const status of ALL_BOOKING_STATUSES) {
      expect(STATUS_TONE[status], `missing tone for "${status}"`).toBeTruthy();
    }
  });
});
