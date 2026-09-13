"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { confirmPickup } from "@/lib/actions/fulfillment";
import type { ActionResult } from "@/lib/actions/bookings";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/common/submit-button";
import { ITEM_CONDITIONS } from "@/lib/constants";

export function PickupDialog({ bookingId }: { bookingId: string }) {
  const [open, setOpen] = useState(false);
  const [metCustomer, setMetCustomer] = useState(false);
  const [matchesDescription, setMatchesDescription] = useState(false);
  const [condition, setCondition] = useState("");
  const [state, formAction] = useActionState<ActionResult | null, FormData>(async (prev, fd) => {
    const result = await confirmPickup(prev, fd);
    if (result && "success" in result) {
      toast.success("Pickup confirmed");
      setOpen(false);
    }
    return result;
  }, null);

  const canSubmit = metCustomer && matchesDescription && condition;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Confirm Pickup</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Pickup</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="bookingId" value={bookingId} />
          <input type="hidden" name="condition" value={condition} />

          <div className="space-y-2 text-sm">
            <label className="flex items-start gap-2">
              <Checkbox checked={metCustomer} onCheckedChange={(v) => setMetCustomer(Boolean(v))} />
              I have met with the customer or their authorized representative.
            </label>
            <label className="flex items-start gap-2">
              <Checkbox checked={matchesDescription} onCheckedChange={(v) => setMatchesDescription(Boolean(v))} />
              The item matches the provided description.
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Item condition</label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {ITEM_CONDITIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Textarea name="notes" placeholder="Optional notes" />

          <p className="rounded-lg bg-warning-bg px-3 py-2 text-xs text-warning">
            Please verify the item carefully before confirming pickup. Once confirmed, you become responsible for
            the safe transport of this item.
          </p>

          {state && "error" in state && <p className="text-sm text-error">{state.error}</p>}

          <SubmitButton className="w-full" disabled={!canSubmit} pendingText="Confirming...">
            Confirm Pickup
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
