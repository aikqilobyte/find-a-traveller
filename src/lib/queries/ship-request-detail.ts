import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ShipRequest, Category } from "@/lib/types/database";

// Cached for the render pass: generateMetadata and the page both need the
// same row, and without this each page view costs two identical queries.
export const getShipRequestById = cache(async (id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ship_requests")
    .select("*, shopper:profiles(*), categories:ship_request_categories(category:categories(*))")
    .eq("id", id)
    .maybeSingle();

  if (!data || error) return null;

  interface RawRow extends Omit<ShipRequest, "categories"> {
    categories: { category: Category }[];
  }
  const raw = data as unknown as RawRow;
  return { ...raw, categories: raw.categories?.map((c) => c.category) ?? [] } as ShipRequest;
});
