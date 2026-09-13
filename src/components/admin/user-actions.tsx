"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setUserSuspended, setUserVerification } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/types/database";

export function UserActions({ user }: { user: Profile }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {user.verification_status !== "verified" && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await setUserVerification(user.id, "verified");
              if ("error" in result) toast.error(result.error);
              else toast.success("User verified");
            })
          }
        >
          Verify
        </Button>
      )}
      <Button
        size="sm"
        variant={user.is_suspended ? "outline" : "ghost"}
        className={user.is_suspended ? "" : "text-error hover:text-error"}
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await setUserSuspended(user.id, !user.is_suspended);
            if ("error" in result) toast.error(result.error);
          })
        }
      >
        {user.is_suspended ? "Unsuspend" : "Suspend"}
      </Button>
    </div>
  );
}
