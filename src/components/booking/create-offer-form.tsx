"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createOfferOnShipRequest } from "@/lib/actions/offers";
import type { ActionResult } from "@/lib/actions/bookings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/common/submit-button";
import type { ShipRequest } from "@/lib/types/database";

export function CreateOfferForm({ request, isGuest = false }: { request: ShipRequest; isGuest?: boolean }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(createOfferOnShipRequest, null);

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-border bg-surface p-6">
      <input type="hidden" name="requestId" value={request.id} />
      <h2 className="font-semibold text-foreground">Create Delivery Offer</h2>

      <div className="space-y-1.5">
        <Label htmlFor="priceCents">Your offer (in cents)</Label>
        <Input
          id="priceCents"
          name="priceCents"
          type="number"
          min={1}
          required
          defaultValue={request.proposed_payment_cents}
          placeholder="How much will you charge for this shipment"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="weightKg">Item weight (kg)</Label>
        <Input id="weightKg" name="weightKg" type="number" step="0.1" min={0.1} required defaultValue={request.weight_kg} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pickupLocation">Pickup location</Label>
        <Input id="pickupLocation" name="pickupLocation" required minLength={3} placeholder="Where will you collect the item?" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deliveryLocation">Delivery location</Label>
        <Input id="deliveryLocation" name="deliveryLocation" required minLength={3} placeholder="Where should it be delivered?" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deliveryConditions">Delivery conditions (optional)</Label>
        <Input id="deliveryConditions" name="deliveryConditions" placeholder="e.g. Cash on delivery, meet in person" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Special instructions (optional)</Label>
        <Textarea id="notes" name="notes" />
      </div>

      {state && "error" in state && (
        <p className="text-sm text-error" role="alert">
          {state.error}
        </p>
      )}

      {isGuest ? (
        <Button asChild className="w-full">
          <Link href={`/login?next=${encodeURIComponent(`/find-a-sender/${request.id}/offer`)}`}>
            Sign in to send this offer
          </Link>
        </Button>
      ) : (
        <SubmitButton className="w-full" pendingText="Sending offer...">
          Send Offer
        </SubmitButton>
      )}
    </form>
  );
}
