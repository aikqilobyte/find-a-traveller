import { createClient } from "@/lib/supabase/server";
import type { Booking, Offer, Payment, Review } from "@/lib/types/database";

export async function getBookingById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(
      "*, shopper:profiles!bookings_shopper_id_fkey(*), traveller:profiles!bookings_traveller_id_fkey(*), traveller_post:traveller_posts(*), ship_request:ship_requests(*)",
    )
    .eq("id", id)
    .maybeSingle();

  return data as unknown as Booking | null;
}

export async function getOffersForBooking(bookingId: string): Promise<Offer[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("offers")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true });
  return (data as Offer[]) ?? [];
}

export async function getPaymentsForBooking(bookingId: string): Promise<Payment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });
  return (data as Payment[]) ?? [];
}

export async function getReviewsForBooking(bookingId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("reviews").select("*").eq("booking_id", bookingId);
  return (data as Review[]) ?? [];
}

export async function getConversationForBooking(bookingId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("conversations").select("id").eq("booking_id", bookingId).maybeSingle();
  return data?.id as string | undefined;
}
