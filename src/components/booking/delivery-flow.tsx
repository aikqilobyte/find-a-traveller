"use client";

import { useActionState, useTransition } from "react";
import { toast } from "sonner";
import { startTransit, initiateDelivery, sendDeliveryOtp, verifyDeliveryOtp } from "@/lib/actions/fulfillment";
import type { ActionResult } from "@/lib/actions/bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/common/submit-button";
import type { BookingStatus } from "@/lib/types/database";

export function DeliveryFlow({ bookingId, status }: { bookingId: string; status: BookingStatus }) {
  const [isPending, startTransition_] = useTransition();

  if (status === "pickup_confirmed") {
    return (
      <Button
        className="w-full"
        disabled={isPending}
        onClick={() =>
          startTransition_(async () => {
            const result = await startTransit(bookingId);
            if (result && "error" in result) toast.error(result.error);
            else toast.success("Marked as in transit");
          })
        }
      >
        Start Transit
      </Button>
    );
  }

  if (status === "in_transit") {
    return (
      <Button
        className="w-full"
        disabled={isPending}
        onClick={() =>
          startTransition_(async () => {
            const result = await initiateDelivery(bookingId);
            if (result && "error" in result) toast.error(result.error);
          })
        }
      >
        Mark as Delivered
      </Button>
    );
  }

  if (status === "delivery_pending") {
    return (
      <Button
        className="w-full"
        disabled={isPending}
        onClick={() =>
          startTransition_(async () => {
            const result = await sendDeliveryOtp(bookingId);
            if ("error" in result) toast.error(result.error);
            else toast.info("Delivery code sent to the package owner.");
          })
        }
      >
        Send Delivery OTP
      </Button>
    );
  }

  if (status === "otp_pending") {
    return <OtpForm bookingId={bookingId} />;
  }

  return null;
}

function OtpForm({ bookingId }: { bookingId: string }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(verifyDeliveryOtp, null);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="bookingId" value={bookingId} />
      {/* The code is never shown here. It reaches the package owner's
          notifications, and the traveller types in what the owner reads
          out at handover. */}
      <p className="rounded-lg bg-info-bg px-3 py-2 text-xs text-info">
        Ask the package owner for the 6-digit code in their notifications once you hand the item over.
      </p>
      <Input name="code" placeholder="Enter 6-digit code" maxLength={6} required pattern="\d{6}" />
      {state && "error" in state && <p className="text-sm text-error">{state.error}</p>}
      <SubmitButton className="w-full" pendingText="Verifying...">
        Submit OTP
      </SubmitButton>
    </form>
  );
}
