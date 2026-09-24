import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";

// Cached for the render pass: generateMetadata and the page both need the
// same row, and without this each profile view costs two identical queries.
export const getProfileById = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  return (data as Profile | null) ?? null;
});
