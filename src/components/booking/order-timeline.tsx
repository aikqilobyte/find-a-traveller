import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types/database";

const STEPS: { key: string; label: string; statuses: BookingStatus[] }[] = [
  { key: "request", label: "Request", statuses: ["requested"] },
  { key: "offer", label: "Offer", statuses: ["offer_pending", "accepted"] },
  { key: "payment", label: "Payment", statuses: ["payment_pending", "paid"] },
  { key: "pickup", label: "Pickup", statuses: ["pickup_pending", "pickup_confirmed"] },
  { key: "transit", label: "In Transit", statuses: ["in_transit"] },
  { key: "delivery", label: "Delivery", statuses: ["delivery_pending", "otp_pending", "delivered"] },
  { key: "completed", label: "Completed", statuses: ["completed"] },
];

const ORDER = STEPS.map((s) => s.key);

function stepIndexForStatus(status: BookingStatus): number {
  const terminal = ["rejected", "cancelled", "expired", "disputed"];
  if (terminal.includes(status)) return -1;
  const found = STEPS.findIndex((step) => step.statuses.includes(status));
  return found === -1 ? 0 : found;
}

export function OrderTimeline({ status }: { status: BookingStatus }) {
  const currentIndex = stepIndexForStatus(status);

  if (currentIndex === -1) {
    return (
      <div className="rounded-lg bg-error-bg px-4 py-3 text-sm font-medium text-error">
        This order was {status}.
      </div>
    );
  }

  return (
    <ol className="flex flex-wrap items-center gap-y-4">
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li key={step.key} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary text-primary",
                  !done && !active && "border-border text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span className={cn("text-xs font-medium", active || done ? "text-foreground" : "text-muted-foreground")}>
                {step.label}
              </span>
            </div>
            {index < ORDER.length - 1 && <span className="mx-3 h-px w-8 bg-border sm:w-12" />}
          </li>
        );
      })}
    </ol>
  );
}
