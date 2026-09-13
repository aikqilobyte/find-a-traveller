import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { MapPin, Package } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import {
  getBookingById,
  getOffersForBooking,
  getPaymentsForBooking,
  getReviewsForBooking,
  getConversationForBooking,
} from "@/lib/queries/booking-detail";
import { StatusBadge } from "@/components/marketplace/status-badge";
import { OrderTimeline } from "@/components/booking/order-timeline";
import { OfferNegotiation } from "@/components/booking/offer-negotiation";
import { PayNowButton } from "@/components/booking/pay-now-button";
import { PickupDialog } from "@/components/booking/pickup-dialog";
import { DeliveryFlow } from "@/components/booking/delivery-flow";
import { CancelBookingButton } from "@/components/booking/cancel-booking-button";
import { ReviewDialog } from "@/components/reviews/review-dialog";
import { ChatWindow } from "@/components/chat/chat-window";
import { getMessagesForConversation } from "@/lib/queries/conversations";
import { formatCents } from "@/lib/money";
import { ReportDialog } from "@/components/reports/report-dialog";

export const metadata: Metadata = { title: "Order Details" };

const CANCELLABLE = ["requested", "offer_pending", "accepted", "payment_pending"];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile(`/dashboard/orders/${id}`);
  const booking = await getBookingById(id);
  if (!booking || (booking.shopper_id !== profile.id && booking.traveller_id !== profile.id)) {
    notFound();
  }

  const [offers, payments, reviews, conversationId] = await Promise.all([
    getOffersForBooking(id),
    getPaymentsForBooking(id),
    getReviewsForBooking(id),
    getConversationForBooking(id),
  ]);

  const messages = conversationId ? await getMessagesForConversation(conversationId) : [];
  const viewerRole: "shopper" | "traveller" = booking.shopper_id === profile.id ? "shopper" : "traveller";
  const otherParty = viewerRole === "shopper" ? booking.traveller : booking.shopper;
  const myReview = reviews.find((r) => r.reviewer_id === profile.id);
  const route = booking.traveller_post ?? booking.ship_request;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Order {booking.booking_number}</h1>
          <p className="text-sm text-muted-foreground capitalize">{booking.service_type.replace("_", " ")}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={booking.status} className="text-sm" />
          <ReportDialog targetType="booking" targetId={booking.id} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <OrderTimeline status={booking.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <Package className="size-4 text-primary" /> Product Details
            </p>
            <p className="mt-2 text-sm text-foreground">{booking.item_description}</p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Info label="Weight" value={`${booking.weight_kg} kg`} />
              <Info label="Quantity" value={String(booking.quantity)} />
              <Info label="Item value" value={formatCents(booking.item_value_cents, booking.currency)} />
            </div>

            <p className="mt-6 flex items-center gap-2 font-semibold text-foreground">
              <MapPin className="size-4 text-primary" /> Shipping Details
            </p>
            <div className="mt-2 space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Pickup: </span>
                {booking.pickup_location}
              </p>
              <p>
                <span className="text-muted-foreground">Delivery: </span>
                {booking.delivery_location}
              </p>
              {booking.preferred_delivery_date && (
                <p>
                  <span className="text-muted-foreground">Preferred date: </span>
                  {format(new Date(booking.preferred_delivery_date), "dd MMM yyyy")}
                </p>
              )}
              {route && (
                <p>
                  <span className="text-muted-foreground">Route: </span>
                  {route.origin_city} → {route.destination_city}
                </p>
              )}
            </div>
            {booking.special_instructions && (
              <p className="mt-2 text-sm text-muted-foreground">Note: {booking.special_instructions}</p>
            )}
          </div>

          {conversationId && (
            <div>
              <h2 className="mb-2 font-semibold text-foreground">Chat with {otherParty?.full_name}</h2>
              <ChatWindow conversationId={conversationId} currentUserId={profile.id} initialMessages={messages} />
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="font-semibold text-foreground">Payment Summary</p>
            <div className="mt-3 space-y-2 text-sm">
              <Row label="Item price" value={formatCents(booking.item_price_cents, booking.currency)} />
              <Row label="Service Fee" value={formatCents(booking.service_fee_cents, booking.currency)} />
              <Row label="Platform Fee" value={formatCents(booking.platform_fee_cents, booking.currency)} />
              <div className="flex justify-between border-t border-border pt-2 font-semibold text-foreground">
                <span>Total</span>
                <span>{formatCents(booking.total_cents, booking.currency)}</span>
              </div>
            </div>
            {payments[0] && (
              <p className="mt-2 text-xs text-muted-foreground">
                Payment status: <span className="font-medium capitalize">{payments[0].status}</span>
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
            <p className="font-semibold text-foreground">Available Actions</p>

            {["requested", "offer_pending"].includes(booking.status) && (
              <OfferNegotiation booking={booking} offers={offers} viewerRole={viewerRole} />
            )}

            {booking.status === "payment_pending" && viewerRole === "shopper" && (
              <PayNowButton bookingId={booking.id} totalCents={booking.total_cents} currency={booking.currency} />
            )}
            {booking.status === "payment_pending" && viewerRole === "traveller" && (
              <p className="text-sm text-muted-foreground">Waiting for the shopper to complete payment.</p>
            )}

            {booking.status === "pickup_pending" && viewerRole === "traveller" && <PickupDialog bookingId={booking.id} />}
            {booking.status === "pickup_pending" && viewerRole === "shopper" && (
              <p className="text-sm text-muted-foreground">Waiting for the traveller to confirm pickup.</p>
            )}

            {viewerRole === "traveller" && ["pickup_confirmed", "in_transit", "delivery_pending", "otp_pending"].includes(booking.status) && (
              <DeliveryFlow bookingId={booking.id} status={booking.status} />
            )}
            {viewerRole === "shopper" && ["pickup_confirmed", "in_transit", "delivery_pending"].includes(booking.status) && (
              <p className="text-sm text-muted-foreground">Your item is on its way.</p>
            )}
            {viewerRole === "shopper" && booking.status === "otp_pending" && (
              <p className="rounded-lg bg-info-bg px-3 py-2 text-xs text-info">
                Check your notifications for the delivery code, and share it with your traveller in person once you
                receive the item.
              </p>
            )}

            {booking.status === "completed" && otherParty && !myReview && (
              <ReviewDialog bookingId={booking.id} revieweeId={otherParty.id} revieweeName={otherParty.full_name} />
            )}
            {booking.status === "completed" && myReview && (
              <p className="text-sm text-success">You&apos;ve reviewed this order. Thank you!</p>
            )}

            {CANCELLABLE.includes(booking.status) && <CancelBookingButton bookingId={booking.id} />}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
