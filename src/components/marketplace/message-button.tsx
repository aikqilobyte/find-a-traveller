"use client";

import { useTransition } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startTravelBuddyConversation } from "@/lib/actions/messages";
import { toast } from "sonner";

export function MessageButton({ postId, otherUserId }: { postId: string; otherUserId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await startTravelBuddyConversation(postId, otherUserId);
          if (result && "error" in result) toast.error(result.error);
        })
      }
    >
      <MessageCircle /> {isPending ? "Opening chat..." : "Message"}
    </Button>
  );
}
