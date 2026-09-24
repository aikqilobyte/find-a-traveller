"use client";

import { useActionState } from "react";
import { createTravellerPost } from "@/lib/actions/traveller-posts";
import type { ActionResult } from "@/lib/actions/bookings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RouteFields } from "@/components/posts/route-fields";
import { CategoryCheckboxes } from "@/components/posts/category-checkboxes";
import { SubmitButton } from "@/components/common/submit-button";
import { TRANSPORT_TYPES } from "@/lib/constants";
import type { Category } from "@/lib/types/database";

export function CreateLuggagePostForm({ categories }: { categories: Category[] }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(createTravellerPost, null);

  return (
    <form action={formAction} className="space-y-6 rounded-2xl border border-border bg-surface p-6">
      <RouteFields />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="departureDate">Departure date</Label>
          <Input id="departureDate" name="departureDate" type="date" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="returnDate">Return date (optional)</Label>
          <Input id="returnDate" name="returnDate" type="date" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Trip type</Label>
          <RadioGroup name="tripType" defaultValue="one_way" className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="one_way" /> One Way
            </label>
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="round_way" /> Round Way
            </label>
          </RadioGroup>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="transportType">Transport type</Label>
          <Select name="transportType" defaultValue="plane">
            <SelectTrigger id="transportType" className="w-full">
              <SelectValue />
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="capacityKg">Available luggage space (kg)</Label>
          <Input id="capacityKg" name="capacityKg" type="number" step="0.1" min={0.5} required placeholder="e.g. 19" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pricePerKgCents">Charge per kg (in cents)</Label>
          <Input id="pricePerKgCents" name="pricePerKgCents" type="number" min={1} required placeholder="e.g. 1000 = $10.00" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Accepted categories</Label>
        <CategoryCheckboxes categories={categories} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Additional notes</Label>
        <Textarea id="notes" name="notes" placeholder="Tell receivers about your trip and how you handle items" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rules">Rules / restrictions</Label>
        <Textarea id="rules" name="rules" placeholder="e.g. No fragile items, meet at airport 2 hours before flight" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="insuranceInfo">Insurance / coverage information</Label>
        <Input id="insuranceInfo" name="insuranceInfo" placeholder="e.g. Covered up to $200 per item" />
      </div>

      {state && "error" in state && (
        <p className="text-sm text-error" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <SubmitButton name="intent" value="publish" className="flex-1" pendingText="Publishing...">
          Publish Listing
        </SubmitButton>
        <Button type="submit" name="intent" value="draft" variant="outline" className="flex-1">
          Save as Draft
        </Button>
      </div>
    </form>
  );
}
