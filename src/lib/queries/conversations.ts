import { createClient } from "@/lib/supabase/server";
import type { Message, Profile } from "@/lib/types/database";

export interface ConversationSummary {
  id: string;
  type: "booking" | "travel_buddy";
  booking_id: string | null;
  travel_buddy_post_id: string | null;
  otherParticipant: Profile | null;
  lastMessage: Message | null;
  unreadCount: number;
}

export async function getConversationsForUser(userId: string): Promise<ConversationSummary[]> {
  const supabase = await createClient();

  const { data: participantRows } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId);

  const conversationIds = (participantRows ?? []).map((r) => r.conversation_id);
  if (conversationIds.length === 0) return [];

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, type, booking_id, travel_buddy_post_id")
    .in("id", conversationIds)
    .order("id", { ascending: false });

  const summaries: ConversationSummary[] = [];

  for (const conversation of conversations ?? []) {
    const { data: participants } = await supabase
      .from("conversation_participants")
      .select("user_id, profile:profiles(*)")
      .eq("conversation_id", conversation.id)
      .neq("user_id", userId);

    const other = (participants?.[0] as unknown as { profile: Profile } | undefined)?.profile ?? null;

    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false })
      .limit(1);

    const { count: unreadCount } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", conversation.id)
      .neq("sender_id", userId)
      .is("read_at", null);

    summaries.push({
      id: conversation.id,
      type: conversation.type as "booking" | "travel_buddy",
      booking_id: conversation.booking_id,
      travel_buddy_post_id: conversation.travel_buddy_post_id,
      otherParticipant: other,
      lastMessage: (messages?.[0] as Message) ?? null,
      unreadCount: unreadCount ?? 0,
    });
  }

  return summaries;
}

export async function getConversationById(conversationId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("conversations")
    .select("id, type, booking_id, travel_buddy_post_id")
    .eq("id", conversationId)
    .maybeSingle();
  return data;
}

export async function getMessagesForConversation(conversationId: string): Promise<Message[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*, sender:profiles(*)")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return (data as unknown as Message[]) ?? [];
}
