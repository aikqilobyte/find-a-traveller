import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getConversationById, getMessagesForConversation } from "@/lib/queries/conversations";
import { ChatWindow } from "@/components/chat/chat-window";

export const metadata: Metadata = { title: "Conversation" };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile(`/dashboard/messages/${id}`);

  const supabase = await createClient();

  // Membership check, conversation and messages are independent lookups —
  // fetch together, then authorise before rendering anything.
  const [conversation, { data: participant }, messages] = await Promise.all([
    getConversationById(id),
    supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", id)
      .eq("user_id", profile.id)
      .maybeSingle(),
    getMessagesForConversation(id),
  ]);

  if (!conversation || !participant) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-semibold text-foreground">Conversation</h1>
      <ChatWindow conversationId={id} currentUserId={profile.id} initialMessages={messages} />
    </div>
  );
}
