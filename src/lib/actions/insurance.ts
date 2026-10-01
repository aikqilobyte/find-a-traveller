"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { friendlyError } from "@/lib/actions/errors";
import type { ActionResult } from "@/lib/actions/bookings";

/**
 * Records the insurance decision before payment. Declining is a decision
 * too — the booking cannot be paid for until one or the other is chosen.
 */
export async function setBookingInsurance(
  bookingId: string,
  opted: boolean,
  declaredValueCents = 0,
): Promise<ActionResult> {
  await requireProfile();

  if (opted && (!Number.isFinite(declaredValueCents) || declaredValueCents <= 0)) {
    return { error: "Enter what the item is worth." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_booking_insurance", {
    p_booking_id: bookingId,
    p_opted: opted,
    p_declared_value_cents: Math.round(declaredValueCents),
  });

  if (error) return { error: friendlyError(error.message) };

  revalidatePath(`/dashboard/orders/${bookingId}`);
  revalidatePath("/dashboard/messages", "layout");
  return { success: true };
}
