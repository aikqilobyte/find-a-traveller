"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setTravellerPostStatus } from "@/lib/actions/traveller-posts";
import { Button } from "@/components/ui/button";
import type { TravellerPostStatus } from "@/lib/types/database";

export function PostStatusControls({ postId, status }: { postId: string; status: TravellerPostStatus }) {
  const [isPending, startTransition] = useTransition();

  function update(next: TravellerPostStatus) {
    startTransition(async () => {
      const result = await setTravellerPostStatus(postId, next);
      if ("error" in result) toast.error(result.error);
    });
  }

  if (!["active", "paused"].includes(status)) return null;

  return (
    <div className="flex gap-2">
      {status === "active" ? (
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => update("paused")}>
          Pause
        </Button>
      ) : (
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => update("active")}>
          Resume
        </Button>
      )}
      <Button size="sm" variant="ghost" className="text-error hover:text-error" disabled={isPending} onClick={() => update("cancelled")}>
        Cancel
      </Button>
    </div>
  );
}
