"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requireProfile, getCurrentProfile } from "@/lib/auth";
import { friendlyError } from "@/lib/actions/errors";

export async function sendMessage(conversationId: string, formData: FormData) {
  const profile = await requireProfile();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Message can't be empty" } as const;

  const supabase = await createClient();
  const { error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: profile.id, body });

  if (error) return { error: friendlyError(error.message) } as const;

  revalidatePath(`/dashboard/messages/${conversationId}`);
  return { success: true } as const;
}

/**
 * Opens (or reopens) an enquiry thread about a post, before any booking
 * exists. Idempotent in the database, so a double click lands on the same
 * thread rather than creating a second one.
 */
export async function startInquiry(input: { travellerPostId?: string; shipRequestId?: string }) {
  const profile = await getCurrentProfile();
  if (!profile) {
    const next = input.travellerPostId ? `/traveller/${input.travellerPostId}` : `/find-a-sender/${input.shipRequestId}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_inquiry", {
    p_traveller_post_id: input.travellerPostId ?? null,
    p_ship_request_id: input.shipRequestId ?? null,
  });

  if (error) return { error: friendlyError(error.message) } as const;

  redirect(`/dashboard/messages/${data as string}`);
}
