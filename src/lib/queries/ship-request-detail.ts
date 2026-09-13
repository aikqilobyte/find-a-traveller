import { createClient } from "@/lib/supabase/server";
import type { ShipRequest, Category } from "@/lib/types/database";

export async function getShipRequestById(id: string) {
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
}
