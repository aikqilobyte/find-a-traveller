"use client";

import { useActionState, useState, useTransition } from "react";
import { toast } from "sonner";
import { acceptOffer, rejectOffer, createCounterOffer } from "@/lib/actions/offers";
import type { ActionResult } from "@/lib/actions/bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SubmitButton } from "@/components/common/submit-button";
import type { Booking, Offer } from "@/lib/types/database";

export function OfferNegotiation({
  booking,
  offers,
  viewerRole,
}: {
  booking: Booking;
  offers: Offer[];
  viewerRole: "shopper" | "traveller";
}) {
  const [isPending, startTransition] = useTransition();
  const lastOffer = offers[offers.length - 1];
  const viewerId = viewerRole === "shopper" ? booking.shopper_id : booking.traveller_id;

  if (!lastOffer) return null;

  const waitingOnOther = lastOffer.made_by === viewerId;

  if (waitingOnOther) {
    return (
      <p className="rounded-lg bg-pending-bg px-3 py-2 text-sm text-pending">
        Waiting for a response to your {offers.length === 1 ? "request" : "counter offer"}.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await acceptOffer(lastOffer.id);
              if ("error" in result) toast.error(result.error);
              else toast.success("Offer accepted");
            })
          }
        >
          Accept
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await rejectOffer(lastOffer.id);
              if ("error" in result) toast.error(result.error);
            })
          }
        >
          Reject
        </Button>
      </div>
      <CounterOfferDialog booking={booking} lastOffer={lastOffer} />
    </div>
  );
}

function CounterOfferDialog({ booking, lastOffer }: { booking: Booking; lastOffer: Offer }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<ActionResult | null, FormData>(async (prev, fd) => {
    const result = await createCounterOffer(prev, fd);
    if (result && "success" in result) {
      toast.success("Counter offer sent");
      setOpen(false);
    }
    return result;
  }, null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full">
          Counter Offer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Counter Offer</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="bookingId" value={booking.id} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Price ({booking.currency} cents)</label>
            <Input name="priceCents" type="number" min={1} defaultValue={lastOffer.price_cents} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Weight (kg)</label>
            <Input name="weightKg" type="number" step="0.1" min={0.1} defaultValue={lastOffer.weight_kg} required />
          </div>
          <Textarea name="notes" placeholder="Notes (optional)" />
          {state && "error" in state && <p className="text-sm text-error">{state.error}</p>}
          <SubmitButton className="w-full" pendingText="Sending...">
            Send Counter Offer
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
