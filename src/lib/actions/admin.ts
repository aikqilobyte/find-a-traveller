"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { friendlyError } from "@/lib/actions/errors";
import type { ActionResult } from "@/lib/actions/bookings";
import type { VerificationStatus, ReportStatus } from "@/lib/types/database";

async function logAdminAction(action: string, targetType: string, targetId: string, notes?: string) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  await supabase.from("admin_actions").insert({ admin_id: admin.id, action, target_type: targetType, target_id: targetId, notes });
}

export async function setUserSuspended(userId: string, suspended: boolean): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ is_suspended: suspended }).eq("id", userId);
  if (error) return { error: friendlyError(error.message) };

  await logAdminAction(suspended ? "suspend_user" : "unsuspend_user", "user", userId);
  revalidatePath("/admin/users");
  return { success: true };
}

export async function setUserVerification(userId: string, status: VerificationStatus): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ verification_status: status }).eq("id", userId);
  if (error) return { error: friendlyError(error.message) };

  await logAdminAction("set_verification", "user", userId, status);
  revalidatePath("/admin/users");
  return { success: true };
}

export async function resolveReport(reportId: string, status: ReportStatus): Promise<ActionResult> {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({ status, resolved_by: admin.id, resolved_at: new Date().toISOString() })
    .eq("id", reportId);
  if (error) return { error: friendlyError(error.message) };

  await logAdminAction("resolve_report", "report", reportId, status);
  revalidatePath("/admin/reports");
  return { success: true };
}
