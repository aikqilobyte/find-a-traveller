"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { friendlyError } from "@/lib/actions/errors";
import type { ActionResult } from "@/lib/actions/bookings";

const schema = z.object({
  targetType: z.enum(["user", "post", "booking", "message"]),
  targetId: z.string().uuid(),
  reason: z.string().min(3),
  description: z.string().optional(),
});

export async function createReport(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const profile = await requireProfile();

  const parsed = schema.safeParse({
    targetType: formData.get("targetType"),
    targetId: formData.get("targetId"),
    reason: formData.get("reason"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({
    reporter_id: profile.id,
    target_type: parsed.data.targetType,
    target_id: parsed.data.targetId,
    reason: parsed.data.reason,
    description: parsed.data.description || null,
  });

  if (error) return { error: friendlyError(error.message) };

  return { success: true };
}
