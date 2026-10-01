import { createClient } from "@/lib/supabase/server";
import type { TransitUpdate } from "@/lib/types/database";

export async function getTransitUpdates(bookingId: string): Promise<TransitUpdate[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transit_updates")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true });
  return (data as TransitUpdate[]) ?? [];
}
