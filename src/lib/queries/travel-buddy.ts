import { createClient } from "@/lib/supabase/server";
import type { TravelBuddyPost } from "@/lib/types/database";

export interface TravelBuddyFilters {
  from?: string;
  to?: string;
  travelDate?: string;
  transport?: string;
  sort?: string;
  page?: string;
}

const PAGE_SIZE = 9;

export async function searchTravelBuddyPosts(filters: TravelBuddyFilters) {
  const supabase = await createClient();
  const page = Math.max(1, Number(filters.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("travel_buddy_posts")
    .select("*, user:profiles(*)", { count: "exact" })
    .eq("status", "active")
    .gte("travel_date", new Date().toISOString().slice(0, 10));

  if (filters.from) query = query.ilike("origin_country", `%${filters.from}%`);
  if (filters.to) query = query.ilike("destination_country", `%${filters.to}%`);
  if (filters.travelDate) query = query.eq("travel_date", filters.travelDate);
  if (filters.transport) query = query.eq("transport_type", filters.transport);

  query = filters.sort === "date_desc"
    ? query.order("travel_date", { ascending: false })
    : query.order("travel_date", { ascending: true });

  const { data, count, error } = await query.range(from, to);

  return {
    posts: (data as unknown as TravelBuddyPost[]) ?? [],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    error: error?.message,
  };
}
