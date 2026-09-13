"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { friendlyError } from "@/lib/actions/errors";

export async function startTravelBuddyConversation(travelBuddyPostId: string, otherUserId: string) {
  const profile = await requireProfile();

  if (profile.id === otherUserId) {
    return { error: "You can't message yourself." } as const;
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("conversations")
    .select("id, conversation_participants(user_id)")
    .eq("type", "travel_buddy")
    .eq("travel_buddy_post_id", travelBuddyPostId);

  const match = (existing as { id: string; conversation_participants: { user_id: string }[] }[] | null)?.find((c) =>
    c.conversation_participants.some((p) => p.user_id === profile.id),
  );

  if (match) {
    redirect(`/dashboard/messages/${match.id}`);
  }

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({ type: "travel_buddy", travel_buddy_post_id: travelBuddyPostId })
    .select()
    .single();

  if (error || !conversation) {
    return { error: friendlyError(error?.message ?? "") } as const;
  }

  await supabase.from("conversation_participants").insert([
    { conversation_id: conversation.id, user_id: profile.id },
    { conversation_id: conversation.id, user_id: otherUserId },
  ]);

  redirect(`/dashboard/messages/${conversation.id}`);
}

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
