import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getConversationById, getMessagesForConversation } from "@/lib/queries/conversations";
import { getBookingById, getOffersForBooking } from "@/lib/queries/booking-detail";
import { ChatWindow } from "@/components/chat/chat-window";
import { getDictionary } from "@/lib/i18n";
import { NextStepBanner } from "@/components/booking/next-step-banner";
import { QuotePanel } from "@/components/chat/quote-panel";

export const metadata: Metadata = { title: "Conversation" };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile(`/dashboard/messages/${id}`);

  const supabase = await createClient();

  // Membership check, conversation and messages are independent lookups —
  // fetch together, then authorise before rendering anything.
  const [conversation, { data: participant }, messages, t] = await Promise.all([
    getConversationById(id),
    supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", id)
      .eq("user_id", profile.id)
      .maybeSingle(),
    getMessagesForConversation(id),
    getDictionary(),
  ]);

  if (!conversation || !participant) notFound();

  // A conversation attached to a booking carries the deal with it, so the
  // next step — including paying — happens here rather than sending the
  // user off to hunt for the order page.
  const bookingId = conversation.booking_id;
  const [booking, offers] = bookingId
    ? await Promise.all([getBookingById(bookingId), getOffersForBooking(bookingId)])
    : [null, []];

  // An enquiry has no booking, so show which post it is about instead —
  // otherwise several enquiries look identical in the thread list.
  const inquiryContext = conversation.traveller_post
    ? {
        label: `${conversation.traveller_post.origin_city} → ${conversation.traveller_post.destination_city}`,
        href: `/traveller/${conversation.traveller_post.id}`,
      }
    : conversation.ship_request
      ? {
          label: conversation.ship_request.item_description,
          href: `/find-a-sender/${conversation.ship_request.id}`,
        }
      : null;

  // Before a quote exists there is no booking to read roles from, so work
  // out which side the viewer is on from the post the enquiry is about.
  const isTravellingSide = conversation.traveller_post
    ? conversation.initiator_id !== profile.id
    : conversation.initiator_id === profile.id;
  const pendingOffer = offers.find((offer) => offer.status === "pending") ?? null;

  const viewerRole = booking ? (booking.shopper_id === profile.id ? "shopper" : "traveller") : null;
  // Negotiation alternates: you can only respond to an offer the other
  // party made.
  const lastOffer = offers[offers.length - 1];
  const isMyTurn = !!lastOffer && lastOffer.made_by !== profile.id;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Conversation</h1>
        {booking ? (
          <Link
            href={`/dashboard/orders/${booking.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Order {booking.booking_number} <ArrowRight className="size-3.5" />
          </Link>
        ) : (
          inquiryContext && (
            <Link
              href={inquiryContext.href}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {inquiryContext.label} <ArrowRight className="size-3.5" />
            </Link>
          )
        )}
      </div>

      {booking && viewerRole && (
        <NextStepBanner booking={booking} viewerRole={viewerRole} isMyTurn={isMyTurn} />
      )}

      {/* The quote lives with the conversation that produced it, so the
          deal can be closed without leaving the thread. */}
      {conversation.type === "inquiry" && (
        <QuotePanel
          conversationId={id}
          viewer={isTravellingSide ? "traveller" : "owner"}
          quote={
            booking
              ? {
                  bookingNumber: booking.booking_number,
                  itemDescription: booking.item_description,
                  weightKg: booking.weight_kg,
                  deadline: booking.preferred_delivery_date,
                  currency: booking.currency,
                  itemPriceCents: booking.item_price_cents,
                  serviceFeeCents: booking.service_fee_cents,
                  platformFeeCents: booking.platform_fee_cents,
                  totalCents: booking.total_cents,
                  offerId: pendingOffer?.id ?? null,
                  status: booking.status,
                }
              : null
          }
        />
      )}

      <ChatWindow conversationId={id} currentUserId={profile.id} initialMessages={messages} t={t.marketplace} />
    </div>
  );
}
