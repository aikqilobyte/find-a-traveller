"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { setBookingInsurance } from "@/lib/actions/insurance";
import { formatCents } from "@/lib/money";

const RATE = 0.02;
const MIN_PREMIUM_CENTS = 100;
const MAX_DECLARED_CENTS = 500_000;

/**
 * Sits between agreeing a price and paying it. A choice is required —
 * insuring or explicitly accepting baseline liability — because the worst
 * version of this conversation is the one that starts after an item is
 * already lost.
 */
export function InsuranceStep({
  bookingId,
  currency,
  itemPriceCents,
  serviceFeeCents,
  platformFeeCents,
  insuranceOpted,
  declaredValueCents,
  insurancePremiumCents,
  liabilityAcknowledged,
}: {
  bookingId: string;
  currency: string;
  itemPriceCents: number;
  serviceFeeCents: number;
  platformFeeCents: number;
  insuranceOpted: boolean;
  declaredValueCents: number;
  insurancePremiumCents: number;
  liabilityAcknowledged: boolean;
}) {
  const decided = insuranceOpted || liabilityAcknowledged;
  const [isPending, startTransition] = useTransition();
  const [choice, setChoice] = useState<"insure" | "decline" | null>(
    insuranceOpted ? "insure" : liabilityAcknowledged ? "decline" : null,
  );
  const [declared, setDeclared] = useState(
    declaredValueCents > 0 ? String(declaredValueCents / 100) : "",
  );
  const [accepted, setAccepted] = useState(liabilityAcknowledged);

  const declaredCents = Math.round((Number(declared) || 0) * 100);
  const previewPremium =
    declaredCents > 0 ? Math.max(Math.round(declaredCents * RATE), MIN_PREMIUM_CENTS) : 0;
  const baseTotal = itemPriceCents + serviceFeeCents + platformFeeCents;

  function save(opted: boolean) {
    startTransition(async () => {
      const result = await setBookingInsurance(bookingId, opted, opted ? declaredCents : 0);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(opted ? "Insurance added" : "Saved — no insurance");
    });
  }

  if (decided) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {insuranceOpted ? (
            <>
              <ShieldCheck className="size-4 shrink-0 text-success" /> Insured for{" "}
              {formatCents(declaredValueCents, currency)}
            </>
          ) : (
            <>
              <ShieldOff className="size-4 shrink-0 text-muted-foreground" /> No insurance
            </>
          )}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {insuranceOpted
            ? `Premium ${formatCents(insurancePremiumCents, currency)} is included in the total below.`
            : "This item travels under the platform's baseline liability limits."}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 h-auto p-0 text-xs"
          disabled={isPending}
          onClick={() => {
            setChoice(null);
            setAccepted(false);
          }}
        >
          Change
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <ShieldCheck className="size-4 shrink-0 text-primary" /> Insure this item?
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose one before paying. Cover costs 2% of the declared value, minimum{" "}
        {formatCents(MIN_PREMIUM_CENTS, currency)}, up to {formatCents(MAX_DECLARED_CENTS, currency)}.
      </p>

      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          variant={choice === "insure" ? "default" : "outline"}
          onClick={() => setChoice("insure")}
          disabled={isPending}
        >
          Insure it
        </Button>
        <Button
          size="sm"
          variant={choice === "decline" ? "default" : "outline"}
          onClick={() => setChoice("decline")}
          disabled={isPending}
        >
          No thanks
        </Button>
      </div>

      {choice === "insure" && (
        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="declaredValue">What is the item worth?</Label>
            <Input
              id="declaredValue"
              type="number"
              min={1}
              step="1"
              inputMode="decimal"
              placeholder="250"
              value={declared}
              onChange={(e) => setDeclared(e.target.value)}
            />
          </div>

          {declaredCents > 0 && (
            <dl className="space-y-1 rounded-lg bg-surface p-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <dt>Order total</dt>
                <dd>{formatCents(baseTotal, currency)}</dd>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <dt>Insurance premium</dt>
                <dd>{formatCents(previewPremium, currency)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-1 font-semibold text-foreground">
                <dt>New total</dt>
                <dd>{formatCents(baseTotal + previewPremium, currency)}</dd>
              </div>
            </dl>
          )}

          <Button
            size="sm"
            className="w-full"
            disabled={isPending || declaredCents <= 0}
            onClick={() => save(true)}
          >
            {isPending ? "Saving..." : "Add insurance"}
          </Button>
        </div>
      )}

      {choice === "decline" && (
        <div className="mt-4 space-y-3">
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <Checkbox
              className="mt-0.5"
              checked={accepted}
              onCheckedChange={(v) => setAccepted(v === true)}
            />
            <span>
              I understand this item is not insured and travels under the platform&apos;s baseline
              liability limits.
            </span>
          </label>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            disabled={isPending || !accepted}
            onClick={() => save(false)}
          >
            {isPending ? "Saving..." : "Continue without insurance"}
          </Button>
        </div>
      )}
    </div>
  );
}
