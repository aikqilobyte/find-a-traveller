"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { updateProfileSchema, changePasswordSchema } from "@/lib/validations/profile";
import { friendlyError } from "@/lib/actions/errors";
import type { ActionResult } from "@/lib/actions/bookings";

export async function updateProfile(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const profile = await requireProfile();

  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    displayName: formData.get("displayName") || undefined,
    phone: formData.get("phone") || undefined,
    country: formData.get("country") || undefined,
    city: formData.get("city") || undefined,
    bio: formData.get("bio") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      display_name: parsed.data.displayName || null,
      phone: parsed.data.phone || null,
      country: parsed.data.country || null,
      city: parsed.data.city || null,
      bio: parsed.data.bio || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  if (error) return { error: friendlyError(error.message) };

  revalidatePath("/dashboard/profile");
  revalidatePath(`/profile/${profile.id}`);
  return { success: true };
}

export async function updateNotificationPreference(enabled: boolean): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ email_notifications_enabled: enabled })
    .eq("id", profile.id);

  if (error) return { error: friendlyError(error.message) };
  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function changePassword(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };

  return { success: true };
}
