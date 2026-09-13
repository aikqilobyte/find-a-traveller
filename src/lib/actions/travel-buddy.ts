"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { createTravelBuddyPostSchema } from "@/lib/validations/posts";
import { friendlyError } from "@/lib/actions/errors";
import type { ActionResult } from "@/lib/actions/bookings";

export async function createTravelBuddyPost(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const profile = await requireProfile();

  const parsed = createTravelBuddyPostSchema.safeParse({
    originCountry: formData.get("originCountry"),
    originCity: formData.get("originCity"),
    destinationCountry: formData.get("destinationCountry"),
    destinationCity: formData.get("destinationCity"),
    travelDate: formData.get("travelDate"),
    returnDate: formData.get("returnDate") || undefined,
    transportType: formData.get("transportType"),
    preferences: formData.get("preferences") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("travel_buddy_posts")
    .insert({
      user_id: profile.id,
      origin_country: parsed.data.originCountry,
      origin_city: parsed.data.originCity,
      destination_country: parsed.data.destinationCountry,
      destination_city: parsed.data.destinationCity,
      travel_date: parsed.data.travelDate,
      return_date: parsed.data.returnDate || null,
      transport_type: parsed.data.transportType,
      preferences: parsed.data.preferences || null,
      description: parsed.data.description || null,
    })
    .select()
    .single();

  if (error || !post) {
    return { error: friendlyError(error?.message ?? "") };
  }

  revalidatePath("/travel-buddy");
  revalidatePath("/dashboard/posts");
  redirect(`/travel-buddy/${post.id}?created=1`);
}

export async function cancelTravelBuddyPost(postId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("travel_buddy_posts").update({ status: "cancelled" }).eq("id", postId);
  if (error) return { error: friendlyError(error.message) };
  revalidatePath("/dashboard/posts");
  return { success: true };
}
