import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getConversationById, getMessagesForConversation } from "@/lib/queries/conversations";
import { getBookingById, getOffersForBooking } from "@/lib/queries/booking-detail";
import { ChatWindow } from "@/components/chat/chat-window";
import { NextStepBanner } from "@/components/booking/next-step-banner";

export const metadata: Metadata = { title: "Conversation" };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile(`/dashboard/messages/${id}`);

  const supabase = await createClient();

  // Membership check, conversation and messages are independent lookups —
  // fetch together, then authorise before rendering anything.
  const [conversation, { data: participant }, messages] = await Promise.all([
    getConversationById(id),
    supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", id)
      .eq("user_id", profile.id)
      .maybeSingle(),
    getMessagesForConversation(id),
  ]);

  if (!conversation || !participant) notFound();

  // A conversation attached to a booking carries the deal with it, so the
  // next step — including paying — happens here rather than sending the
  // user off to hunt for the order page.
  const bookingId = conversation.booking_id;
  const [booking, offers] = bookingId
    ? await Promise.all([getBookingById(bookingId), getOffersForBooking(bookingId)])
    : [null, []];

  const viewerRole = booking ? (booking.shopper_id === profile.id ? "shopper" : "traveller") : null;
  // Negotiation alternates: you can only respond to an offer the other
  // party made.
  const lastOffer = offers[offers.length - 1];
  const isMyTurn = !!lastOffer && lastOffer.made_by !== profile.id;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Conversation</h1>
        {booking && (
          <Link
            href={`/dashboard/orders/${booking.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Order {booking.booking_number} <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>

      {booking && viewerRole && (
        <NextStepBanner booking={booking} viewerRole={viewerRole} isMyTurn={isMyTurn} />
      )}

      <ChatWindow conversationId={id} currentUserId={profile.id} initialMessages={messages} />
    </div>
  );
}
