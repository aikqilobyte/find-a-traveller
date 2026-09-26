"use client";

import { useTransition } from "react";
import { MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startInquiry } from "@/lib/actions/messages";

/**
 * Opens an enquiry thread about a post before any booking exists, so the
 * two sides can agree the details first. Both stay anonymous until a
 * booking is made and paid for.
 */
export function StartChatButton({
  travellerPostId,
  shipRequestId,
  label,
  className,
  variant = "outline",
  size,
}: {
  travellerPostId?: string;
  shipRequestId?: string;
  label: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "sm" | "lg" | "icon";
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await startInquiry({ travellerPostId, shipRequestId });
          // A successful call redirects, so anything returned is a failure.
          if (result && "error" in result) toast.error(result.error);
        })
      }
    >
      <MessageSquareText /> {label}
    </Button>
  );
}
