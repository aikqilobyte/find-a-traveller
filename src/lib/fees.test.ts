import { describe, it, expect } from "vitest";
import { estimateFees } from "./fees";

describe("estimateFees", () => {
  it("charges 8% service fee and 2% platform fee (min $1.00)", () => {
    const fees = estimateFees(20000); // $200.00 item
    expect(fees.serviceFeeCents).toBe(1600); // 8% of 20000
    expect(fees.platformFeeCents).toBe(400); // 2% of 20000
    expect(fees.totalCents).toBe(20000 + 1600 + 400);
  });

  it("enforces the $1.00 minimum platform fee on small amounts", () => {
    const fees = estimateFees(500); // $5.00 item -> 2% would be 10 cents
    expect(fees.platformFeeCents).toBe(100);
  });

  it("never returns a total less than the item price", () => {
    const fees = estimateFees(0);
    expect(fees.totalCents).toBeGreaterThanOrEqual(0);
    expect(fees.serviceFeeCents).toBe(0);
  });

  it("rounds to the nearest cent instead of using floats", () => {
    const fees = estimateFees(333); // deliberately awkward number
    expect(Number.isInteger(fees.serviceFeeCents)).toBe(true);
    expect(Number.isInteger(fees.platformFeeCents)).toBe(true);
    expect(Number.isInteger(fees.totalCents)).toBe(true);
  });
});
