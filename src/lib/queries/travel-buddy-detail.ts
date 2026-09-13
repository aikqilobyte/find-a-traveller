import { createClient } from "@/lib/supabase/server";
import type { TravelBuddyPost } from "@/lib/types/database";

export async function getTravelBuddyPostById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("travel_buddy_posts")
    .select("*, user:profiles(*)")
    .eq("id", id)
    .maybeSingle();

  return data as unknown as TravelBuddyPost | null;
}
