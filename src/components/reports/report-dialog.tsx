"use client";

import { useActionState, useState } from "react";
import { Flag } from "lucide-react";
import { createReport } from "@/lib/actions/reports";
import type { ActionResult } from "@/lib/actions/bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SubmitButton } from "@/components/common/submit-button";

export function ReportDialog({
  targetType,
  targetId,
}: {
  targetType: "user" | "post" | "booking" | "message";
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<ActionResult | null, FormData>(async (prev, fd) => {
    const result = await createReport(prev, fd);
    if (result && "success" in result) setOpen(false);
    return result;
  }, null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="size-3.5" /> Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this {targetType}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="targetType" value={targetType} />
          <input type="hidden" name="targetId" value={targetId} />
          <Input name="reason" placeholder="Reason (e.g. Suspicious activity)" required minLength={3} />
          <Textarea name="description" placeholder="Add more detail (optional)" />
          {state && "error" in state && <p className="text-sm text-error">{state.error}</p>}
          <SubmitButton className="w-full" variant="outline" pendingText="Submitting...">
            Submit Report
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
