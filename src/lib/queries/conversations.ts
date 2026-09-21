import { createClient } from "@/lib/supabase/server";
import type { Message, Profile } from "@/lib/types/database";

export interface ConversationSummary {
  id: string;
  booking_id: string | null;
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

  // Three queries total regardless of conversation count, rather than
  // three per conversation.
  const [{ data: conversations }, { data: participants }, { data: messages }] = await Promise.all([
    supabase.from("conversations").select("id, booking_id").in("id", conversationIds),
    supabase
      .from("conversation_participants")
      .select("conversation_id, user_id, profile:profiles(*)")
      .in("conversation_id", conversationIds)
      .neq("user_id", userId),
    supabase
      .from("messages")
      .select("*")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false }),
  ]);

  const otherByConversation = new Map<string, Profile>();
  for (const row of (participants ?? []) as unknown as { conversation_id: string; profile: Profile }[]) {
    if (row.profile && !otherByConversation.has(row.conversation_id)) {
      otherByConversation.set(row.conversation_id, row.profile);
    }
  }

  const lastByConversation = new Map<string, Message>();
  const unreadByConversation = new Map<string, number>();
  for (const message of (messages ?? []) as Message[]) {
    if (!lastByConversation.has(message.conversation_id)) {
      lastByConversation.set(message.conversation_id, message);
    }
    if (message.sender_id !== userId && message.read_at === null) {
      unreadByConversation.set(
        message.conversation_id,
        (unreadByConversation.get(message.conversation_id) ?? 0) + 1,
      );
    }
  }

  return (conversations ?? [])
    .map((conversation) => ({
      id: conversation.id,
      booking_id: conversation.booking_id,
      otherParticipant: otherByConversation.get(conversation.id) ?? null,
      lastMessage: lastByConversation.get(conversation.id) ?? null,
      unreadCount: unreadByConversation.get(conversation.id) ?? 0,
    }))
    .sort((a, b) => {
      const at = a.lastMessage?.created_at ?? "";
      const bt = b.lastMessage?.created_at ?? "";
      return bt.localeCompare(at);
    });
}

export async function getConversationById(conversationId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("conversations")
    .select("id, booking_id")
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
