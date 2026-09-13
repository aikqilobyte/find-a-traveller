"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pickupConfirmationSchema, deliveryOtpSchema } from "@/lib/validations/booking";
import { friendlyError } from "@/lib/actions/errors";
import type { ActionResult } from "@/lib/actions/bookings";

export async function confirmPickup(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = pickupConfirmationSchema.safeParse({
    bookingId: formData.get("bookingId"),
    condition: formData.get("condition"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("confirm_pickup", {
    p_booking_id: parsed.data.bookingId,
    p_condition: parsed.data.condition,
    p_photo_urls: [],
    p_notes: parsed.data.notes ?? null,
  });

  if (error) return { error: friendlyError(error.message) };

  revalidatePath(`/dashboard/orders/${parsed.data.bookingId}`);
  return { success: true };
}

export async function startTransit(bookingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("start_transit", { p_booking_id: bookingId });
  if (error) return { error: friendlyError(error.message) };
  revalidatePath(`/dashboard/orders/${bookingId}`);
  return { success: true };
}

export async function initiateDelivery(bookingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("initiate_delivery", { p_booking_id: bookingId });
  if (error) return { error: friendlyError(error.message) };
  revalidatePath(`/dashboard/orders/${bookingId}`);
  return { success: true };
}

// Dev/test mode: since no SMS provider is configured, the plaintext code
// is returned to the traveller's own screen with a clear "test mode"
// label instead of silently pretending an SMS was sent. See
// send_delivery_otp() in the functions migration for the security model
// (bcrypt hash stored, plaintext never persisted).
export async function sendDeliveryOtp(bookingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("send_delivery_otp", { p_booking_id: bookingId });
  if (error) return { error: friendlyError(error.message) } as const;
  revalidatePath(`/dashboard/orders/${bookingId}`);
  return { success: true, code: data as string } as const;
}

export async function verifyDeliveryOtp(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = deliveryOtpSchema.safeParse({
    bookingId: formData.get("bookingId"),
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("verify_delivery_otp", {
    p_booking_id: parsed.data.bookingId,
    p_code: parsed.data.code,
  });

  if (error) return { error: friendlyError(error.message) };

  revalidatePath(`/dashboard/orders/${parsed.data.bookingId}`);
  return { success: true };
}
