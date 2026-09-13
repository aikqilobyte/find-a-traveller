"use client";

import { useActionState } from "react";
import { createTravelBuddyPost } from "@/lib/actions/travel-buddy";
import type { ActionResult } from "@/lib/actions/bookings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RouteFields } from "@/components/posts/route-fields";
import { SubmitButton } from "@/components/common/submit-button";
import { TRANSPORT_TYPES } from "@/lib/constants";

export function CreateTravelBuddyForm() {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(createTravelBuddyPost, null);

  return (
    <form action={formAction} className="space-y-6 rounded-2xl border border-border bg-surface p-6">
      <RouteFields />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="travelDate">Travel date</Label>
          <Input id="travelDate" name="travelDate" type="date" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="returnDate">Return date (optional)</Label>
          <Input id="returnDate" name="returnDate" type="date" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="transportType">Transport</Label>
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

      <div className="space-y-1.5">
        <Label htmlFor="preferences">Travel preferences</Label>
        <Input id="preferences" name="preferences" placeholder="e.g. Non-smoker, prefers window seat" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Short description</Label>
        <Textarea id="description" name="description" placeholder="Tell potential travel buddies about your trip" />
      </div>

      {state && "error" in state && (
        <p className="text-sm text-error" role="alert">
          {state.error}
        </p>
      )}

      <SubmitButton className="w-full" pendingText="Publishing...">
        Publish Travel Buddy Post
      </SubmitButton>
    </form>
  );
}
