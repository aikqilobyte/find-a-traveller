"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { createPaymentIntent, confirmTestPayment } from "@/lib/actions/payments";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/money";

export function PayNowButton({ bookingId, totalCents, currency }: { bookingId: string; totalCents: number; currency: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <p className="rounded-lg bg-warning-bg px-3 py-2 text-xs text-warning">
        Test mode — no real charge will be made. In production this uses Stripe (see .env.example).
      </p>
      <Button
        size="lg"
        className="w-full"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const intent = await createPaymentIntent(bookingId);
            if ("error" in intent) {
              toast.error(intent.error);
              return;
            }
            const confirmed = await confirmTestPayment(intent.payment.id, bookingId);
            if ("error" in confirmed) {
              toast.error(confirmed.error);
              return;
            }
            toast.success("Payment successful");
          })
        }
      >
        {isPending ? "Processing..." : `Pay ${formatCents(totalCents, currency)} (Test Mode)`}
      </Button>
    </div>
  );
}
