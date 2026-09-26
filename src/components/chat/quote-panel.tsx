"use client";

import { useState, useTransition } from "react";
import { FileText, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createQuote } from "@/lib/actions/quotes";
import { acceptOffer, rejectOffer } from "@/lib/actions/offers";
import { formatCents } from "@/lib/money";

/**
 * The point where a conversation becomes a work order.
 *
 * The travelling side fills in what was agreed; the package owner sees it
 * as a card with the work order number and the full fee breakdown, and
 * accepting it moves the booking to payment.
 */
export function QuotePanel({
  conversationId,
  viewer,
  quote,
}: {
  conversationId: string;
  viewer: "traveller" | "owner";
  quote: {
    bookingNumber: string;
    itemDescription: string;
    weightKg: number;
    deadline: string | null;
    currency: string;
    itemPriceCents: number;
    serviceFeeCents: number;
    platformFeeCents: number;
    totalCents: number;
    offerId: string | null;
    status: string;
  } | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  if (quote) {
    const awaitingOwner = quote.status === "offer_pending" && quote.offerId;

    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-2">
          <FileText className="size-4 shrink-0 text-primary" />
          <p className="text-sm font-semibold text-foreground">Work order {quote.bookingNumber}</p>
        </div>

        <p className="mt-2 text-sm text-foreground">{quote.itemDescription}</p>
        <p className="text-xs text-muted-foreground">
          {quote.weightKg} kg{quote.deadline ? ` · by ${quote.deadline}` : ""}
        </p>

        <dl className="mt-3 space-y-1 border-t border-primary/20 pt-3 text-sm">
          <Row label="Agreed fee" value={formatCents(quote.itemPriceCents, quote.currency)} />
          <Row label="Service fee" value={formatCents(quote.serviceFeeCents, quote.currency)} />
          <Row label="Platform fee" value={formatCents(quote.platformFeeCents, quote.currency)} />
          <div className="flex justify-between border-t border-primary/20 pt-1 font-semibold text-foreground">
            <dt>Total</dt>
            <dd>{formatCents(quote.totalCents, quote.currency)}</dd>
          </div>
        </dl>

        {awaitingOwner && viewer === "owner" && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const result = await acceptOffer(quote.offerId!);
                  if ("error" in result) toast.error(result.error);
                })
              }
            >
              <Check /> Accept &amp; continue to payment
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const result = await rejectOffer(quote.offerId!);
                  if ("error" in result) toast.error(result.error);
                })
              }
            >
              <X /> Decline
            </Button>
          </div>
        )}

        {awaitingOwner && viewer === "traveller" && (
          <p className="mt-3 text-xs text-muted-foreground">
            Sent. You&apos;ll be notified as soon as the package owner responds.
          </p>
        )}
      </div>
    );
  }

  // No quote yet. Only the travelling side can raise one — but the other
  // side should still know what it is waiting for, rather than seeing an
  // empty space where the deal is supposed to happen.
  if (viewer !== "traveller") {
    return (
      <div className="rounded-xl border border-border bg-surface-muted/60 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FileText className="size-4 shrink-0 text-muted-foreground" /> No quote yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Agree the details here first. The traveller then sends a quote with the final price, and
          you pay only once you&apos;ve accepted it.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" className="w-full" onClick={() => setOpen(true)}>
        <FileText /> Create Quote
      </Button>
    );
  }

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          const result = await createQuote(conversationId, formData);
          if ("error" in result) {
            toast.error(result.error);
            return;
          }
          setOpen(false);
          toast.success("Quote sent");
        })
      }
      className="space-y-3 rounded-xl border border-border bg-surface p-4"
    >
      <p className="text-sm font-semibold text-foreground">Create quote</p>
      <p className="text-xs text-muted-foreground">
        Put in what you both agreed. Once accepted, payment is held until delivery is confirmed.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="priceCents">Agreed fee (in cents)</Label>
          <Input id="priceCents" name="priceCents" type="number" min={1} required placeholder="8000" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="weightKg">Weight (kg)</Label>
          <Input id="weightKg" name="weightKg" type="number" min={0.1} step="0.1" required placeholder="2" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="itemDescription">What you&apos;re carrying</Label>
        <Input id="itemDescription" name="itemDescription" required minLength={3} placeholder="Documents, clothing, gifts" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pickupLocation">Pick-up location</Label>
          <Input id="pickupLocation" name="pickupLocation" required minLength={3} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="deliveryLocation">Delivery location</Label>
          <Input id="deliveryLocation" name="deliveryLocation" required minLength={3} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deadline">Deliver by (optional)</Label>
        <Input id="deadline" name="deadline" type="date" />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? "Sending..." : "Send Quote"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
