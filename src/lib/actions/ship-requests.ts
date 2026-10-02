"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { createShipRequestSchema } from "@/lib/validations/posts";
import { friendlyError } from "@/lib/actions/errors";
import type { ActionResult } from "@/lib/actions/bookings";

function parseCategoryIds(formData: FormData) {
  return formData.getAll("categoryIds").map(String).filter(Boolean);
}

export async function createShipRequest(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const profile = await requireProfile();

  const parsed = createShipRequestSchema.safeParse({
    originCountry: formData.get("originCountry"),
    originCity: formData.get("originCity"),
    destinationCountry: formData.get("destinationCountry"),
    destinationCity: formData.get("destinationCity"),
    itemDescription: formData.get("itemDescription"),
    quantity: formData.get("quantity") || 1,
    weightKg: formData.get("weightKg"),
    itemValueUsd: formData.get("itemValueUsd") || 0,
    deadline: formData.get("deadline") || undefined,
    proposedPaymentUsd: formData.get("proposedPaymentUsd"),
    transportPreference: formData.get("transportPreference") || undefined,
    notes: formData.get("notes") || undefined,
    categoryIds: parseCategoryIds(formData),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const publish = formData.get("intent") === "publish";
  const supabase = await createClient();

  const { data: request, error } = await supabase
    .from("ship_requests")
    .insert({
      shopper_id: profile.id,
      origin_country: parsed.data.originCountry,
      origin_city: parsed.data.originCity,
      destination_country: parsed.data.destinationCountry,
      destination_city: parsed.data.destinationCity,
      item_description: parsed.data.itemDescription,
      quantity: parsed.data.quantity,
      weight_kg: parsed.data.weightKg,
      item_value_cents: parsed.data.itemValueUsd,
      deadline: parsed.data.deadline || null,
      proposed_payment_cents: parsed.data.proposedPaymentUsd,
      transport_preference: parsed.data.transportPreference || null,
      notes: parsed.data.notes || null,
      status: publish ? "active" : "draft",
    })
    .select()
    .single();

  if (error || !request) {
    return { error: friendlyError(error?.message ?? "") };
  }

  if (parsed.data.categoryIds.length > 0) {
    await supabase.from("ship_request_categories").insert(
      parsed.data.categoryIds.map((categoryId) => ({ request_id: request.id, category_id: categoryId })),
    );
  }

  revalidatePath("/find-a-sender");
  revalidatePath("/dashboard/posts");
  // A published request has a public page worth landing on; a draft has
  // nowhere to show, so send it back to the list. Both of these routes
  // exist — the previous target, /dashboard/posts/ship-requests/[id], never
  // did, so publishing always 404'd.
  redirect(publish ? `/find-a-sender/${request.id}` : "/dashboard/posts");
}
