"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
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
