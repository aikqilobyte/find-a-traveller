import type { Metadata } from "next";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { requireProfile } from "@/lib/auth";
import { getConversationsForUser } from "@/lib/queries/conversations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import { MessageSquare } from "lucide-react";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const profile = await requireProfile("/dashboard/messages");
  const conversations = await getConversationsForUser(profile.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Messages</h1>

      <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
        {conversations.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No conversations yet" description="Book a listing or message a travel buddy to start chatting." />
        ) : (
          conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/dashboard/messages/${conversation.id}`}
              className="flex items-center gap-3 p-4 hover:bg-surface-muted"
            >
              <Avatar>
                <AvatarImage src={conversation.otherParticipant?.avatar_url ?? undefined} />
                <AvatarFallback>{conversation.otherParticipant?.full_name.slice(0, 2).toUpperCase() ?? "?"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {conversation.otherParticipant?.full_name ?? "User"}
                  </p>
                  {conversation.lastMessage && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {conversation.lastMessage?.body ?? "No messages yet"}
                </p>
              </div>
              {conversation.unreadCount > 0 && <Badge>{conversation.unreadCount}</Badge>}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
