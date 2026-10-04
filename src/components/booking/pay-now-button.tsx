"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { startCheckout } from "@/lib/actions/payments";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/money";

/**
 * The button does not know which payment provider is running. The action
 * either returns a URL to send the payer to, or settles a simulated
 * charge — so configuring Stripe changes behaviour without touching the
 * UI, and removing the keys does not break the booking flow.
 */
export function PayNowButton({
  bookingId,
  totalCents,
  currency,
  stripeEnabled,
}: {
  bookingId: string;
  totalCents: number;
  currency: string;
  stripeEnabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <p className="rounded-lg bg-warning-bg px-3 py-2 text-xs text-warning">
        {stripeEnabled
          ? "Test mode — use card 4242 4242 4242 4242, any future expiry and any CVC. No real charge is made."
          : "Test mode — no real charge will be made. Add Stripe keys to use a real checkout."}
      </p>
      <Button
        size="lg"
        className="w-full"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await startCheckout(bookingId);

            if ("error" in result) {
              toast.error(result.error);
              return;
            }

            if ("url" in result && result.url) {
              window.location.assign(result.url);
              return;
            }

            toast.success("Payment successful");
          })
        }
      >
        {isPending ? "Processing..." : `Pay ${formatCents(totalCents, currency)}`}
      </Button>
    </div>
  );
}
