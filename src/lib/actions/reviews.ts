"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { reviewSchema } from "@/lib/validations/booking";
import { friendlyError } from "@/lib/actions/errors";
import type { ActionResult } from "@/lib/actions/bookings";

export async function createReview(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse({
    bookingId: formData.get("bookingId"),
    revieweeId: formData.get("revieweeId"),
    rating: formData.get("rating"),
    comment: formData.get("comment") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_review", {
    p_booking_id: parsed.data.bookingId,
    p_reviewee_id: parsed.data.revieweeId,
    p_rating: parsed.data.rating,
    p_comment: parsed.data.comment ?? null,
  });

  if (error) {
    if (error.message.includes("duplicate")) {
      return { error: "You've already reviewed this order." };
    }
    return { error: friendlyError(error.message) };
  }

  revalidatePath(`/dashboard/orders/${parsed.data.bookingId}`);
  return { success: true };
}
