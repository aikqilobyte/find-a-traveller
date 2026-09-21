import { createClient } from "@/lib/supabase/server";
import type { TravellerPost, ShipRequest } from "@/lib/types/database";

export async function getMyTravellerPosts(userId: string): Promise<TravellerPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("traveller_posts")
    .select("*")
    .eq("traveller_id", userId)
    .order("created_at", { ascending: false });
  return (data as TravellerPost[]) ?? [];
}

export async function getMyShipRequests(userId: string): Promise<ShipRequest[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ship_requests")
    .select("*")
    .eq("shopper_id", userId)
    .order("created_at", { ascending: false });
  return (data as ShipRequest[]) ?? [];
}
