import { describe, it, expect } from "vitest";
import { formatCents, centsToUnits, unitsToCents } from "./money";

describe("money helpers", () => {
  it("formats cents as a currency string", () => {
    expect(formatCents(20050, "USD")).toBe("$200.50");
    expect(formatCents(100, "USD")).toBe("$1.00");
  });

  it("converts cents to display units", () => {
    expect(centsToUnits(2050)).toBe(20.5);
  });

  it("converts display units to integer cents without float drift", () => {
    expect(unitsToCents(20.5)).toBe(2050);
    expect(unitsToCents(0.1 + 0.2)).toBe(30); // classic float trap: 0.1+0.2 !== 0.3
  });
});
