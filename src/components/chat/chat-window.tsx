"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Send, Paperclip } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "@/lib/actions/messages";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types/database";

export function ChatWindow({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [pending, setPending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => (prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new as Message]));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await sendMessage(conversationId, formData);
    setPending(false);
    if (!result || !("error" in result)) {
      formRef.current?.reset();
    }
  }

  return (
    <div className="flex h-[32rem] flex-col rounded-2xl border border-border bg-surface">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Say hello to start the conversation.</p>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_id === currentUserId;
            return (
              <div key={message.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[75%] rounded-2xl px-3 py-2 text-sm", isMine ? "bg-primary text-primary-foreground" : "bg-surface-muted text-foreground")}>
                  {message.body && <p className="whitespace-pre-wrap">{message.body}</p>}
                  <p className={cn("mt-1 text-[10px]", isMine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {format(new Date(message.created_at), "HH:mm · EEE")}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <form
        ref={formRef}
        action={handleSubmit}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <Button type="button" variant="ghost" size="icon" disabled title="Image attachments are not enabled in this environment">
          <Paperclip className="size-4" />
        </Button>
        <input
          name="body"
          placeholder="Write a text here..."
          autoComplete="off"
          required
          className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <Button type="submit" size="icon" disabled={pending}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
