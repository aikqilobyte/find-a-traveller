"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createLuggageBookingSchema } from "@/lib/validations/booking";
import { friendlyError } from "@/lib/actions/errors";

export type ActionResult<T = undefined> = { error: string } | { success: true; data?: T };

export async function createLuggageBooking(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = createLuggageBookingSchema.safeParse({
    postId: formData.get("postId"),
    weightKg: formData.get("weightKg"),
    itemDescription: formData.get("itemDescription"),
    categoryId: formData.get("categoryId") || undefined,
    quantity: formData.get("quantity") || 1,
    itemValueCents: formData.get("itemValueCents") || 0,
    pickupLocation: formData.get("pickupLocation"),
    deliveryLocation: formData.get("deliveryLocation"),
    preferredDeliveryDate: formData.get("preferredDeliveryDate") || undefined,
    specialInstructions: formData.get("specialInstructions") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_luggage_booking", {
    p_post_id: parsed.data.postId,
    p_weight_kg: parsed.data.weightKg,
    p_item_description: parsed.data.itemDescription,
    p_category_id: parsed.data.categoryId ?? null,
    p_quantity: parsed.data.quantity,
    p_item_value_cents: parsed.data.itemValueCents,
    p_pickup_location: parsed.data.pickupLocation,
    p_delivery_location: parsed.data.deliveryLocation,
    p_preferred_delivery_date: parsed.data.preferredDeliveryDate ?? null,
    p_special_instructions: parsed.data.specialInstructions ?? null,
  });

  if (error) {
    return { error: friendlyError(error.message) };
  }

  revalidatePath("/find-a-traveller");
  redirect(`/dashboard/orders/${(data as { id: string }).id}?created=1`);
}

export async function cancelBooking(bookingId: string, reason?: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_booking", {
    p_booking_id: bookingId,
    p_reason: reason ?? null,
  });

  if (error) {
    return { error: friendlyError(error.message) };
  }

  revalidatePath(`/dashboard/orders/${bookingId}`);
  revalidatePath("/dashboard/orders");
  return { success: true };
}
