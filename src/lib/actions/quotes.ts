"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { friendlyError } from "@/lib/actions/errors";
import type { ActionResult } from "@/lib/actions/bookings";

/**
 * Turns an agreed enquiry into a numbered work order. Only the travelling
 * side can send one; the package owner accepts it and pays.
 */
export async function createQuote(conversationId: string, formData: FormData): Promise<ActionResult> {
  await requireProfile();

  const priceRaw = Number(formData.get("priceCents"));
  const weightRaw = Number(formData.get("weightKg"));
  const itemDescription = String(formData.get("itemDescription") ?? "").trim();
  const pickupLocation = String(formData.get("pickupLocation") ?? "").trim();
  const deliveryLocation = String(formData.get("deliveryLocation") ?? "").trim();
  const deadline = String(formData.get("deadline") ?? "").trim();

  if (!Number.isFinite(priceRaw) || priceRaw <= 0) return { error: "Enter the agreed fee." };
  if (!Number.isFinite(weightRaw) || weightRaw <= 0) return { error: "Enter the agreed weight." };
  if (!itemDescription) return { error: "Describe what is being carried." };
  if (!pickupLocation || !deliveryLocation) return { error: "Add both pick-up and delivery locations." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_quote", {
    p_conversation_id: conversationId,
    p_price_cents: Math.round(priceRaw),
    p_weight_kg: weightRaw,
    p_item_description: itemDescription,
    p_pickup_location: pickupLocation,
    p_delivery_location: deliveryLocation,
    p_deadline: deadline || null,
  });

  if (error) return { error: friendlyError(error.message) };

  revalidatePath(`/dashboard/messages/${conversationId}`);
  return { success: true };
}
