import { describe, it, expect } from "vitest";
import { friendlyError } from "./errors";

describe("friendlyError", () => {
  it("maps known Postgres function error codes to plain language", () => {
    expect(friendlyError("insufficient_capacity")).toMatch(/enough available space/i);
    expect(friendlyError("otp_incorrect")).toMatch(/incorrect/i);
    expect(friendlyError("cannot_book_own_post")).toMatch(/own listing/i);
  });

  it("never leaks raw database error text for unknown codes", () => {
    const raw = 'duplicate key value violates unique constraint "reviews_booking_id_reviewer_id_key"';
    expect(friendlyError(raw)).toBe("Something went wrong. Please try again.");
  });
});
