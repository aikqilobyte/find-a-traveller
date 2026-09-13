"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { resolveReport } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function ReportActions({ reportId, status }: { reportId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  if (status !== "open" && status !== "reviewing") return null;

  function act(next: "reviewing" | "resolved" | "dismissed") {
    startTransition(async () => {
      const result = await resolveReport(reportId, next);
      if ("error" in result) toast.error(result.error);
    });
  }

  return (
    <div className="flex gap-2">
      {status === "open" && (
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => act("reviewing")}>
          Review
        </Button>
      )}
      <Button size="sm" disabled={isPending} onClick={() => act("resolved")}>
        Resolve
      </Button>
      <Button size="sm" variant="ghost" disabled={isPending} onClick={() => act("dismissed")}>
        Dismiss
      </Button>
    </div>
  );
}
