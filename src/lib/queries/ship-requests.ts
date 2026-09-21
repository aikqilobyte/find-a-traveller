import { createClient } from "@/lib/supabase/server";
import { buildLocationOrFilter } from "@/lib/queries/location-filter";
import type { ShipRequest } from "@/lib/types/database";

export interface ShipRequestFilters {
  from?: string;
  to?: string;
  /** Earliest acceptable deadline. */
  fromDate?: string;
  /** Latest acceptable deadline. */
  toDate?: string;
  /** Max weight the traveller can carry. */
  weight?: string;
  category?: string;
  minBudget?: string;
  maxBudget?: string;
  maxWeight?: string;
  transport?: string;
  sort?: string;
  page?: string;
}

const PAGE_SIZE = 9;

export async function searchShipRequests(filters: ShipRequestFilters) {
  const supabase = await createClient();
  const page = Math.max(1, Number(filters.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("ship_requests")
    .select("*, shopper:profiles(*), categories:ship_request_categories(category:categories(*))", {
      count: "exact",
    })
    .in("status", ["active", "offer_received"]);

  const originFilter = filters.from ? buildLocationOrFilter(filters.from, "origin_city", "origin_country") : null;
  const destinationFilter = filters.to
    ? buildLocationOrFilter(filters.to, "destination_city", "destination_country")
    : null;
  if (originFilter) query = query.or(originFilter);
  if (destinationFilter) query = query.or(destinationFilter);

  if (filters.fromDate) query = query.gte("deadline", filters.fromDate);
  if (filters.toDate) query = query.lte("deadline", filters.toDate);
  // A traveller searching with a weight means "I can carry up to this".
  const maxWeight = filters.maxWeight ?? filters.weight;
  if (maxWeight) query = query.lte("weight_kg", Number(maxWeight));
  if (filters.transport) query = query.eq("transport_preference", filters.transport);
  if (filters.minBudget) query = query.gte("proposed_payment_cents", Number(filters.minBudget) * 100);
  if (filters.maxBudget) query = query.lte("proposed_payment_cents", Number(filters.maxBudget) * 100);

  switch (filters.sort) {
    case "budget_asc":
      query = query.order("proposed_payment_cents", { ascending: true });
      break;
    case "budget_desc":
      query = query.order("proposed_payment_cents", { ascending: false });
      break;
    case "deadline":
      query = query.order("deadline", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, count, error } = await query.range(from, to);

  interface RawRow extends Omit<ShipRequest, "categories"> {
    categories: { category: { id: string; name: string; slug: string } }[];
  }

  const rows = (data as unknown as RawRow[]) ?? [];
  let requests: ShipRequest[] = rows.map((row) => ({
    ...row,
    categories: row.categories?.map((c) => c.category) ?? [],
  }));

  if (filters.category) {
    requests = requests.filter((r) => r.categories?.some((c) => c.slug === filters.category));
  }

  return {
    requests,
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    error: error?.message,
  };
}
