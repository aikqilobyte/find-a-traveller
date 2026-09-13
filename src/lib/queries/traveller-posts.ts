import { createClient } from "@/lib/supabase/server";
import type { TravellerPost } from "@/lib/types/database";

export interface TravellerPostFilters {
  from?: string;
  to?: string;
  departureDate?: string;
  returnDate?: string;
  weight?: string;
  category?: string;
  tripType?: string;
  transport?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
}

const PAGE_SIZE = 9;

export async function searchTravellerPosts(filters: TravellerPostFilters) {
  const supabase = await createClient();
  const page = Math.max(1, Number(filters.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("traveller_posts")
    .select("*, traveller:profiles(*), categories:traveller_post_categories(category:categories(*))", {
      count: "exact",
    })
    .eq("status", "active")
    .gte("departure_date", new Date().toISOString().slice(0, 10));

  if (filters.from) query = query.ilike("origin_country", `%${filters.from}%`);
  if (filters.to) query = query.ilike("destination_country", `%${filters.to}%`);
  if (filters.departureDate) query = query.eq("departure_date", filters.departureDate);
  if (filters.weight) query = query.gte("remaining_capacity_kg", Number(filters.weight));
  if (filters.tripType) query = query.eq("trip_type", filters.tripType);
  if (filters.transport) query = query.in("transport_type", filters.transport.split(","));
  if (filters.minPrice) query = query.gte("price_per_kg_cents", Number(filters.minPrice) * 100);
  if (filters.maxPrice) query = query.lte("price_per_kg_cents", Number(filters.maxPrice) * 100);

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price_per_kg_cents", { ascending: true });
      break;
    case "capacity_desc":
      query = query.order("remaining_capacity_kg", { ascending: false });
      break;
    case "departure_date":
      query = query.order("departure_date", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, count, error } = await query.range(from, to);

  interface RawRow extends Omit<TravellerPost, "categories"> {
    categories: { category: { id: string; name: string; slug: string } }[];
  }

  const rows = (data as unknown as RawRow[]) ?? [];

  // Normalize the nested join shape (join table makes an exact SQL
  // category filter awkward, so filter in memory here — page sizes are
  // small enough that this stays cheap).
  let posts: TravellerPost[] = rows.map((row) => ({
    ...row,
    categories: row.categories?.map((c) => c.category) ?? [],
  }));

  if (filters.category) {
    posts = posts.filter((post) => post.categories?.some((c) => c.slug === filters.category));
  }

  return {
    posts,
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    error: error?.message,
  };
}
