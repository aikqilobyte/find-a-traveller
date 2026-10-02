"use client";

import { useActionState } from "react";
import { createShipRequest } from "@/lib/actions/ship-requests";
import type { ActionResult } from "@/lib/actions/bookings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RouteFields } from "@/components/posts/route-fields";
import { CategoryCheckboxes } from "@/components/posts/category-checkboxes";
import { SubmitButton } from "@/components/common/submit-button";
import { TRANSPORT_TYPES } from "@/lib/constants";
import type { Category } from "@/lib/types/database";

export function CreateShipRequestForm({ categories }: { categories: Category[] }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(createShipRequest, null);

  return (
    <form action={formAction} className="space-y-6 rounded-2xl border border-border bg-surface p-6">
      <RouteFields />

      <div className="space-y-1.5">
        <Label htmlFor="itemDescription">Item description</Label>
        <Textarea id="itemDescription" name="itemDescription" required minLength={3} placeholder="What do you need brought to you?" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" name="quantity" type="number" min={1} defaultValue={1} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="weightKg">Weight (kg)</Label>
          <Input id="weightKg" name="weightKg" type="number" step="0.1" min={0.1} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="itemValueUsd">Item value (USD)</Label>
          <Input id="itemValueUsd" name="itemValueUsd" type="number" min={0} step="0.01" placeholder="200.00" />
          <p className="text-xs text-muted-foreground">
            Roughly what the item is worth. Used for insurance and customs, not what you pay.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="deadline">Deadline (optional)</Label>
          <Input id="deadline" name="deadline" type="date" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="proposedPaymentUsd">What you&apos;ll pay the traveller (USD)</Label>
          <Input
            id="proposedPaymentUsd"
            name="proposedPaymentUsd"
            type="number"
            min={0.01}
            step="0.01"
            required
            placeholder="25.00"
          />
          <p className="text-xs text-muted-foreground">
            Your starting offer for carrying this. Travellers can accept it or counter with their own
            price, so treat it as a suggestion rather than a final figure.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="transportPreference">Transport preference (optional)</Label>
        <Select name="transportPreference">
          <SelectTrigger id="transportPreference" className="w-full">
            <SelectValue placeholder="No preference" />
          </SelectTrigger>
          <SelectContent>
            {TRANSPORT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Item category</Label>
        <CategoryCheckboxes categories={categories} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" placeholder="e.g. Please ensure it's factory sealed and comes with a receipt." />
      </div>

      {state && "error" in state && (
        <p className="text-sm text-error" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <SubmitButton name="intent" value="publish" className="flex-1" pendingText="Publishing...">
          Publish Request
        </SubmitButton>
        <Button type="submit" name="intent" value="draft" variant="outline" className="flex-1">
          Save as Draft
        </Button>
      </div>
    </form>
  );
}
