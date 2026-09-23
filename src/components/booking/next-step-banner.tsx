import { ArrowRight, CheckCircle2, CreditCard, Hourglass, PackageCheck } from "lucide-react";
import { PayNowButton } from "@/components/booking/pay-now-button";
import { cn } from "@/lib/utils";
import type { Booking } from "@/lib/types/database";

/**
 * Sits directly above the chat so the deal never dead-ends in conversation:
 * whatever the booking needs next is stated here, with the action inline
 * where possible rather than in a sidebar the user has to go find.
 */
export function NextStepBanner({
  booking,
  viewerRole,
  isMyTurn,
}: {
  booking: Booking;
  viewerRole: "shopper" | "traveller";
  isMyTurn: boolean;
}) {
  const isReceiver = viewerRole === "shopper";

  if (booking.status === "payment_pending") {
    return isReceiver ? (
      <Banner
        tone="action"
        icon={CreditCard}
        title="Agreed — one step left"
        body="Pay to confirm this booking. Your money is held safely and only released to the traveller after delivery, and you'll both see each other's details straight away."
      >
        <PayNowButton
          bookingId={booking.id}
          totalCents={booking.total_cents}
          currency={booking.currency}
        />
      </Banner>
    ) : (
      <Banner
        tone="waiting"
        icon={Hourglass}
        title="Waiting on payment"
        body="The receiver has been asked to pay. You'll get a notification the moment it goes through, and their details will unlock for you then."
      />
    );
  }

  if (booking.status === "requested" || booking.status === "offer_pending") {
    return isMyTurn ? (
      <Banner
        tone="action"
        icon={ArrowRight}
        title="Your turn to respond"
        body="Accept, decline, or send a counter offer using Available Actions. Once someone accepts, the next step is payment."
      />
    ) : (
      <Banner
        tone="waiting"
        icon={Hourglass}
        title="Waiting for a reply"
        body="Keep chatting here to agree the details. When you both agree, whoever received the last offer accepts it and payment follows."
      />
    );
  }

  if (booking.status === "pickup_pending") {
    return (
      <Banner
        tone="action"
        icon={PackageCheck}
        title="Paid — arrange the handover"
        body={
          isReceiver
            ? "Payment is complete and details are now visible. Use the chat to agree a time and place to hand over the package."
            : "Payment is complete. Agree a handover time here, then confirm pickup in Available Actions once you have the package."
        }
      />
    );
  }

  if (booking.status === "completed") {
    return (
      <Banner
        tone="done"
        icon={CheckCircle2}
        title="Delivered"
        body="This order is complete. Leave a review to help the next person decide — and this conversation stays here for your records."
      />
    );
  }

  return null;
}

const TONES = {
  action: "border-primary/30 bg-primary/5",
  waiting: "border-border bg-surface-muted/60",
  done: "border-success/30 bg-success-bg",
} as const;

function Banner({
  tone,
  icon: Icon,
  title,
  body,
  children,
}: {
  tone: keyof typeof TONES;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-xl border p-4", TONES[tone])}>
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 size-5 shrink-0", tone === "done" ? "text-success" : "text-primary")} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}
