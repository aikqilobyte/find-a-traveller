"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createOfferSchema, counterOfferSchema } from "@/lib/validations/booking";
import { friendlyError } from "@/lib/actions/errors";
import type { ActionResult } from "@/lib/actions/bookings";

export async function createOfferOnShipRequest(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = createOfferSchema.safeParse({
    requestId: formData.get("requestId"),
    priceCents: formData.get("priceCents"),
    weightKg: formData.get("weightKg"),
    deliveryConditions: formData.get("deliveryConditions") || undefined,
    notes: formData.get("notes") || undefined,
    pickupLocation: formData.get("pickupLocation"),
    deliveryLocation: formData.get("deliveryLocation"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_offer_on_ship_request", {
    p_request_id: parsed.data.requestId,
    p_price_cents: parsed.data.priceCents,
    p_weight_kg: parsed.data.weightKg,
    p_delivery_conditions: parsed.data.deliveryConditions ?? null,
    p_notes: parsed.data.notes ?? null,
    p_pickup_location: parsed.data.pickupLocation,
    p_delivery_location: parsed.data.deliveryLocation,
  });

  if (error) {
    return { error: friendlyError(error.message) };
  }

  revalidatePath("/find-a-sender");
  redirect(`/dashboard/offers/${(data as { id: string }).id}?created=1`);
}

export async function createCounterOffer(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = counterOfferSchema.safeParse({
    bookingId: formData.get("bookingId"),
    priceCents: formData.get("priceCents"),
    weightKg: formData.get("weightKg"),
    deliveryConditions: formData.get("deliveryConditions") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_counter_offer", {
    p_booking_id: parsed.data.bookingId,
    p_price_cents: parsed.data.priceCents,
    p_weight_kg: parsed.data.weightKg,
    p_delivery_conditions: parsed.data.deliveryConditions ?? null,
    p_notes: parsed.data.notes ?? null,
  });

  if (error) {
    return { error: friendlyError(error.message) };
  }

  revalidatePath(`/dashboard/offers/${parsed.data.bookingId}`);
  return { success: true };
}

export async function acceptOffer(offerId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_offer", { p_offer_id: offerId });

  if (error) {
    return { error: friendlyError(error.message) };
  }

  const booking = data as { id: string };
  revalidatePath(`/dashboard/offers/${booking.id}`);
  revalidatePath("/dashboard/offers");
  return { success: true, data: booking as never };
}

export async function rejectOffer(offerId: string, reason?: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_offer", { p_offer_id: offerId, p_reason: reason ?? null });

  if (error) {
    return { error: friendlyError(error.message) };
  }

  revalidatePath("/dashboard/offers");
  return { success: true };
}
