import { createClient } from "@/lib/supabase/server";
import type { ShipRequest } from "@/lib/types/database";

export interface ShipRequestFilters {
  from?: string;
  to?: string;
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

  if (filters.from) query = query.ilike("origin_country", `%${filters.from}%`);
  if (filters.to) query = query.ilike("destination_country", `%${filters.to}%`);
  if (filters.maxWeight) query = query.lte("weight_kg", Number(filters.maxWeight));
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
