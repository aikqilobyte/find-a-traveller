"use client";

import { useActionState, useState, useTransition } from "react";
import { toast } from "sonner";
import { startTransit, initiateDelivery, sendDeliveryOtp, verifyDeliveryOtp } from "@/lib/actions/fulfillment";
import type { ActionResult } from "@/lib/actions/bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/common/submit-button";
import type { BookingStatus } from "@/lib/types/database";

export function DeliveryFlow({ bookingId, status }: { bookingId: string; status: BookingStatus }) {
  const [isPending, startTransition_] = useTransition();
  const [otp, setOtp] = useState<string | null>(null);

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
            if ("error" in result) {
              toast.error(result.error);
            } else {
              setOtp(result.code);
              toast.info("Delivery code sent to the shopper.");
            }
          })
        }
      >
        Send Delivery OTP
      </Button>
    );
  }

  if (status === "otp_pending") {
    return <OtpForm bookingId={bookingId} testCode={otp} />;
  }

  return null;
}

function OtpForm({ bookingId, testCode }: { bookingId: string; testCode: string | null }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(verifyDeliveryOtp, null);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="bookingId" value={bookingId} />
      {testCode && (
        <p className="rounded-lg bg-info-bg px-3 py-2 text-xs text-info">
          Test mode — no SMS is configured. The code is <span className="font-mono font-semibold">{testCode}</span>.
        </p>
      )}
      <Input name="code" placeholder="Enter 6-digit code" maxLength={6} required pattern="\d{6}" />
      {state && "error" in state && <p className="text-sm text-error">{state.error}</p>}
      <SubmitButton className="w-full" pendingText="Verifying...">
        Submit OTP
      </SubmitButton>
    </form>
  );
}
