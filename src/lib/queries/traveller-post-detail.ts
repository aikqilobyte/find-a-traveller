import { createClient } from "@/lib/supabase/server";
import type { TravellerPost, Category } from "@/lib/types/database";

export async function getTravellerPostById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("traveller_posts")
    .select("*, traveller:profiles(*), categories:traveller_post_categories(category:categories(*))")
    .eq("id", id)
    .maybeSingle();

  if (!data || error) return null;

  interface RawRow extends Omit<TravellerPost, "categories"> {
    categories: { category: Category }[];
  }
  const raw = data as unknown as RawRow;
  return {
    ...raw,
    categories: raw.categories?.map((c) => c.category) ?? [],
  } as TravellerPost;
}
