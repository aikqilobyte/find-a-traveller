"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { PlaneTakeoff, Plane, PlaneLanding, Truck, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addTransitUpdate } from "@/lib/actions/transit";
import { cn } from "@/lib/utils";
import type { TransitStage, TransitUpdate } from "@/lib/types/database";

const STAGES: { value: TransitStage; label: string; icon: typeof Plane }[] = [
  { value: "boarding", label: "Boarding", icon: PlaneTakeoff },
  { value: "in_transit", label: "In transit", icon: Plane },
  { value: "landed", label: "Landed", icon: PlaneLanding },
  { value: "out_for_delivery", label: "Out for delivery", icon: Truck },
];

/**
 * Where the parcel is, between handover and delivery.
 *
 * The package owner sees a read-only timeline; the traveller sees the
 * same timeline plus the controls to add to it. Posting a checkpoint is
 * informational — it never decides custody or delivery, which rest on
 * pickup confirmation and the delivery code.
 */
export function TransitTimeline({
  bookingId,
  updates,
  canPost,
}: {
  bookingId: string;
  updates: TransitUpdate[];
  canPost: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [stage, setStage] = useState<TransitStage | null>(null);
  const [note, setNote] = useState("");

  const reached = new Set(updates.map((u) => u.stage));

  function post() {
    if (!stage) return;
    startTransition(async () => {
      const result = await addTransitUpdate(bookingId, stage, note);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setStage(null);
      setNote("");
      toast.success("Update posted");
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="font-semibold text-foreground">Tracking</p>

      {/* Progress across the fixed stages, so the shape of the journey is
          readable at a glance even before any detail is read. */}
      <div className="mt-4 flex items-center">
        {STAGES.map((s, i) => {
          const done = reached.has(s.value);
          return (
            <div key={s.value} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border",
                    done
                      ? "border-success bg-success-bg text-success"
                      : "border-border bg-surface-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-4" /> : <s.icon className="size-4" />}
                </span>
                <span
                  className={cn(
                    "text-center text-[10px] leading-tight",
                    done ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <span
                  className={cn(
                    "mx-1 mb-4 h-0.5 flex-1",
                    done ? "bg-success" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {updates.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">
          {canPost
            ? "Post your first update so the package owner knows it's moving."
            : "No updates yet. The traveller will post as the package moves."}
        </p>
      ) : (
        <ol className="mt-5 space-y-3 border-t border-border pt-4">
          {updates.map((u) => {
            const meta = STAGES.find((s) => s.value === u.stage);
            const Icon = meta?.icon ?? Plane;
            return (
              <li key={u.id} className="flex gap-3">
                <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{meta?.label ?? u.stage}</p>
                  {u.note && <p className="text-sm text-muted-foreground">{u.note}</p>}
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(u.created_at), "dd MMM yyyy · HH:mm")}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {canPost && (
        <div className="mt-5 space-y-3 border-t border-border pt-4">
          <p className="text-sm font-medium text-foreground">Post an update</p>
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <Button
                key={s.value}
                size="sm"
                variant={stage === s.value ? "default" : "outline"}
                onClick={() => setStage(s.value)}
                disabled={isPending}
              >
                <s.icon /> {s.label}
              </Button>
            ))}
          </div>

          {stage && (
            <div className="space-y-2">
              <Input
                placeholder="Optional note — e.g. delayed 3 hours at Doha"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
              />
              <Button size="sm" className="w-full" disabled={isPending} onClick={post}>
                {isPending ? "Posting..." : "Post update"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
