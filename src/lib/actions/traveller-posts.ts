"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { createTravellerPostSchema } from "@/lib/validations/posts";
import { friendlyError } from "@/lib/actions/errors";
import type { ActionResult } from "@/lib/actions/bookings";
import type { TravellerPostStatus } from "@/lib/types/database";

function parseCategoryIds(formData: FormData) {
  return formData.getAll("categoryIds").map(String).filter(Boolean);
}

export async function createTravellerPost(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const profile = await requireProfile();

  const parsed = createTravellerPostSchema.safeParse({
    originCountry: formData.get("originCountry"),
    originCity: formData.get("originCity"),
    destinationCountry: formData.get("destinationCountry"),
    destinationCity: formData.get("destinationCity"),
    departureDate: formData.get("departureDate"),
    returnDate: formData.get("returnDate") || undefined,
    tripType: formData.get("tripType"),
    transportType: formData.get("transportType"),
    capacityKg: formData.get("capacityKg"),
    pricePerKgCents: formData.get("pricePerKgCents"),
    notes: formData.get("notes") || undefined,
    rules: formData.get("rules") || undefined,
    insuranceInfo: formData.get("insuranceInfo") || undefined,
    categoryIds: parseCategoryIds(formData),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const publish = formData.get("intent") === "publish";
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("traveller_posts")
    .insert({
      traveller_id: profile.id,
      origin_country: parsed.data.originCountry,
      origin_city: parsed.data.originCity,
      destination_country: parsed.data.destinationCountry,
      destination_city: parsed.data.destinationCity,
      departure_date: parsed.data.departureDate,
      return_date: parsed.data.returnDate || null,
      trip_type: parsed.data.tripType,
      transport_type: parsed.data.transportType,
      capacity_kg: parsed.data.capacityKg,
      remaining_capacity_kg: parsed.data.capacityKg,
      price_per_kg_cents: parsed.data.pricePerKgCents,
      notes: parsed.data.notes || null,
      rules: parsed.data.rules || null,
      insurance_info: parsed.data.insuranceInfo || null,
      status: publish ? "active" : "draft",
    })
    .select()
    .single();

  if (error || !post) {
    return { error: friendlyError(error?.message ?? "") };
  }

  if (parsed.data.categoryIds.length > 0) {
    await supabase.from("traveller_post_categories").insert(
      parsed.data.categoryIds.map((categoryId) => ({ post_id: post.id, category_id: categoryId })),
    );
  }

  revalidatePath("/find-a-traveller");
  revalidatePath("/dashboard/posts");
  redirect(`/dashboard/posts/${post.id}?created=1`);
}

export async function setTravellerPostStatus(postId: string, status: TravellerPostStatus): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_post_status", { p_post_id: postId, p_status: status });
  if (error) return { error: friendlyError(error.message) };

  revalidatePath("/dashboard/posts");
  revalidatePath("/find-a-traveller");
  return { success: true };
}
