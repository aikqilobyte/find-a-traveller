// All money is stored and calculated in integer minor units (cents) —
// never floating point. These helpers only format for display.

export function formatCents(cents: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function centsToUnits(cents: number): number {
  return Math.round(cents) / 100;
}

export function unitsToCents(units: number): number {
  return Math.round(units * 100);
}
