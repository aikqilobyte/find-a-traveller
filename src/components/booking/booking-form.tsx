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
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function BookingForm({
  post,
  categories,
  isGuest = false,
  t,
}: {
  post: TravellerPost;
  categories: Category[];
  isGuest?: boolean;
  t: Dictionary["forms"];
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(createLuggageBooking, null);
  const [weightKg, setWeightKg] = useState<number>(Math.min(1, post.remaining_capacity_kg));
  const [categoryId, setCategoryId] = useState<string>("");

  const fees = useMemo(() => estimateFees(Math.round((weightKg || 0) * post.price_per_kg_cents)), [weightKg, post.price_per_kg_cents]);

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-border bg-surface p-6">
      <input type="hidden" name="postId" value={post.id} />
      <input type="hidden" name="categoryId" value={categoryId} />
      <h2 className="font-semibold text-foreground">{t.addProductDetails}</h2>

      <div className="space-y-1.5">
        <Label htmlFor="itemDescription">{t.whatShipping}</Label>
        <Textarea
          id="itemDescription"
          name="itemDescription"
          required
          minLength={3}
          placeholder={t.describeItems}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="weightKg">{t.estimatedWeight}</Label>
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
          <Label htmlFor="categoryId-select">{t.category}</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="categoryId-select" className="w-full">
              <SelectValue placeholder={t.selectCategory} />
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
        <Label htmlFor="pickupLocation">{t.pickupLocation}</Label>
        <Input id="pickupLocation" name="pickupLocation" required minLength={3} placeholder={t.pickupPlaceholder} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deliveryLocation">{t.deliveryLocation}</Label>
        <Input id="deliveryLocation" name="deliveryLocation" required minLength={3} placeholder={t.deliveryPlaceholder} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="preferredDeliveryDate">{t.preferredDate}</Label>
        <Input id="preferredDeliveryDate" name="preferredDeliveryDate" type="date" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="specialInstructions">{t.specialInstructions}</Label>
        <Textarea id="specialInstructions" name="specialInstructions" />
      </div>

      <div className="space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>{t.itemPrice} ({weightKg || 0} kg)</span>
          <span>{formatCents(fees.itemPriceCents, post.currency)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>{t.serviceFee}</span>
          <span>{formatCents(fees.serviceFeeCents, post.currency)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>{t.platformFee}</span>
          <span>{formatCents(fees.platformFeeCents, post.currency)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2 font-semibold text-foreground">
          <span>{t.total}</span>
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
            {t.signInToBook}
          </Link>
        </Button>
      ) : (
        <SubmitButton className="w-full" size="lg" pendingText={t.submittingRequest}>
          {t.bookSpace}
        </SubmitButton>
      )}
      <p className="text-center text-xs text-muted-foreground">{t.notChargedYet}</p>
    </form>
  );
}
