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
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function CreateOfferForm({
  request,
  isGuest = false,
  t,
}: {
  request: ShipRequest;
  isGuest?: boolean;
  t: Dictionary["forms"];
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(createOfferOnShipRequest, null);

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-border bg-surface p-6">
      <input type="hidden" name="requestId" value={request.id} />
      <h2 className="font-semibold text-foreground">{t.createOffer}</h2>

      <div className="space-y-1.5">
        <Label htmlFor="priceCents">{t.yourOffer}</Label>
        <Input
          id="priceCents"
          name="priceCents"
          type="number"
          min={1}
          required
          defaultValue={request.proposed_payment_cents}
          placeholder={t.offerPlaceholder}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="weightKg">{t.offerWeight}</Label>
        <Input id="weightKg" name="weightKg" type="number" step="0.1" min={0.1} required defaultValue={request.weight_kg} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pickupLocation">{t.pickupLocation}</Label>
        <Input id="pickupLocation" name="pickupLocation" required minLength={3} placeholder={t.offerPickupPlaceholder} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deliveryLocation">{t.deliveryLocation}</Label>
        <Input id="deliveryLocation" name="deliveryLocation" required minLength={3} placeholder={t.offerDeliveryPlaceholder} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deliveryConditions">{t.deliveryConditions}</Label>
        <Input id="deliveryConditions" name="deliveryConditions" placeholder={t.conditionsPlaceholder} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">{t.specialInstructions}</Label>
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
            {t.signInToOffer}
          </Link>
        </Button>
      ) : (
        <SubmitButton className="w-full" pendingText={t.sendingOffer}>
          {t.sendOffer}
        </SubmitButton>
      )}
    </form>
  );
}
