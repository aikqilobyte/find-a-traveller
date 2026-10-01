"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { friendlyError } from "@/lib/actions/errors";
import type { ActionResult } from "@/lib/actions/bookings";
import type { TransitStage } from "@/lib/types/database";

/** Posts a transit checkpoint. Traveller only — enforced in the database. */
export async function addTransitUpdate(
  bookingId: string,
  stage: TransitStage,
  note?: string,
): Promise<ActionResult> {
  await requireProfile();

  const supabase = await createClient();
  const { error } = await supabase.rpc("add_transit_update", {
    p_booking_id: bookingId,
    p_stage: stage,
    p_note: note?.trim() || null,
  });

  if (error) return { error: friendlyError(error.message) };

  revalidatePath(`/dashboard/orders/${bookingId}`);
  return { success: true };
}
