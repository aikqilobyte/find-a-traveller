import { createClient } from "@/lib/supabase/server";
import type { Review } from "@/lib/types/database";

export async function getReviewsForUser(userId: string, limit = 10) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, reviewer:profiles!reviews_reviewer_id_fkey(*)")
    .eq("reviewee_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data as unknown as Review[]) ?? [];
}
