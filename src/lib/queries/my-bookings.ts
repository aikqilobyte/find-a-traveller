import { createClient } from "@/lib/supabase/server";
import type { Booking } from "@/lib/types/database";

export async function getMyBookings(userId: string, statuses?: string[]): Promise<Booking[]> {
  const supabase = await createClient();
  let query = supabase
    .from("bookings")
    .select(
      "*, shopper:profiles!bookings_shopper_id_fkey(*), traveller:profiles!bookings_traveller_id_fkey(*)",
    )
    .or(`shopper_id.eq.${userId},traveller_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (statuses && statuses.length > 0) {
    query = query.in("status", statuses);
  }

  const { data } = await query;
  return (data as unknown as Booking[]) ?? [];
}
