"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createLuggageBooking } from "@/lib/actions/bookings";
import type { ActionResult } from "@/lib/actions/bookings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/common/submit-button";
import { estimateFees } from "@/lib/fees";
import { formatCents } from "@/lib/money";
import type { Category, TravellerPost } from "@/lib/types/database";

export function BookingForm({
  post,
  categories,
  isGuest = false,
}: {
  post: TravellerPost;
  categories: Category[];
  isGuest?: boolean;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(createLuggageBooking, null);
  const [weightKg, setWeightKg] = useState<number>(Math.min(1, post.remaining_capacity_kg));
  const [categoryId, setCategoryId] = useState<string>("");

  const fees = useMemo(() => estimateFees(Math.round((weightKg || 0) * post.price_per_kg_cents)), [weightKg, post.price_per_kg_cents]);

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-border bg-surface p-6">
      <input type="hidden" name="postId" value={post.id} />
      <input type="hidden" name="categoryId" value={categoryId} />
      <h2 className="font-semibold text-foreground">Add your product details</h2>

      <div className="space-y-1.5">
        <Label htmlFor="itemDescription">What are you shipping</Label>
        <Textarea
          id="itemDescription"
          name="itemDescription"
          required
          minLength={3}
          placeholder="Describe your items (e.g. documents, clothing, gifts)"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="weightKg">Estimated weight (kg)</Label>
          <Input
            id="weightKg"
            name="weightKg"
            type="number"
            step="0.1"
            min={0.1}
            max={post.remaining_capacity_kg}
            required
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">{post.remaining_capacity_kg} kg available</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="categoryId-select">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="categoryId-select" className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pickupLocation">Pick-up location</Label>
        <Input id="pickupLocation" name="pickupLocation" required minLength={3} placeholder="Where will the traveller collect your item?" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deliveryLocation">Delivery location</Label>
        <Input id="deliveryLocation" name="deliveryLocation" required minLength={3} placeholder="Where should your items be delivered?" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="preferredDeliveryDate">Preferred delivery date (optional)</Label>
        <Input id="preferredDeliveryDate" name="preferredDeliveryDate" type="date" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="specialInstructions">Special instructions (optional)</Label>
        <Textarea id="specialInstructions" name="specialInstructions" />
      </div>

      <div className="space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Item price ({weightKg || 0} kg)</span>
          <span>{formatCents(fees.itemPriceCents, post.currency)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Service Fee</span>
          <span>{formatCents(fees.serviceFeeCents, post.currency)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Platform Fee</span>
          <span>{formatCents(fees.platformFeeCents, post.currency)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2 font-semibold text-foreground">
          <span>Total</span>
          <span>{formatCents(fees.totalCents, post.currency)}</span>
        </div>
      </div>

      {state && "error" in state && (
        <p className="text-sm text-error" role="alert">
          {state.error}
        </p>
      )}

      {isGuest ? (
        <Button asChild size="lg" className="w-full">
          <Link href={`/login?next=${encodeURIComponent(`/traveller/${post.id}/book`)}`}>
            Sign in to book this space
          </Link>
        </Button>
      ) : (
        <SubmitButton className="w-full" size="lg" pendingText="Submitting request...">
          Book Space
        </SubmitButton>
      )}
      <p className="text-center text-xs text-muted-foreground">You won&apos;t be charged until your booking is confirmed.</p>
    </form>
  );
}
