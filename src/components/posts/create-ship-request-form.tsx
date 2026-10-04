"use client";

import { useActionState } from "react";
import { createShipRequest } from "@/lib/actions/ship-requests";
import { createGuestShipRequest } from "@/lib/actions/guest-posts";
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

/**
 * The same form serves signed-in and signed-out posters. Keeping one copy
 * means a field added for one is never missing from the other — the shape
 * of a request should not depend on whether somebody happened to be
 * logged in when they wrote it.
 */
export function CreateShipRequestForm({
  categories,
  guest = false,
}: {
  categories: Category[];
  guest?: boolean;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    guest ? createGuestShipRequest : createShipRequest,
    null,
  );

  // A guest has no dashboard to be redirected to, so the confirmation has
  // to happen here.
  if (guest && state && "success" in state) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 text-center">
        <h2 className="text-lg font-semibold text-foreground">Your request is posted</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We have emailed you a link to manage it. Travellers can make offers right away, and that
          link is how you read them — no password needed.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6 rounded-2xl border border-border bg-surface p-6">
      {guest && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Your name</Label>
            <Input id="fullName" name="fullName" required minLength={2} placeholder="Your full name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Your email</Label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
            <p className="text-xs text-muted-foreground">
              Where offers on this request are sent.
            </p>
          </div>
        </div>
      )}

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

      {guest ? (
        <SubmitButton name="intent" value="publish" className="w-full" pendingText="Posting...">
          Post Request
        </SubmitButton>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <SubmitButton name="intent" value="publish" className="flex-1" pendingText="Publishing...">
            Publish Request
          </SubmitButton>
          <Button type="submit" name="intent" value="draft" variant="outline" className="flex-1">
            Save as Draft
          </Button>
        </div>
      )}
    </form>
  );
}
