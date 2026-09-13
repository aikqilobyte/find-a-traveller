"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateNotificationPreference } from "@/lib/actions/profile";

export function NotificationToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-6">
      <div>
        <Label htmlFor="email-notifications">Email notifications</Label>
        <p className="text-sm text-muted-foreground">Get emailed about bookings, offers, and messages.</p>
      </div>
      <Switch
        id="email-notifications"
        checked={enabled}
        disabled={isPending}
        onCheckedChange={(checked) => {
          setEnabled(checked);
          startTransition(async () => {
            const result = await updateNotificationPreference(checked);
            if ("error" in result) {
              toast.error(result.error);
              setEnabled(!checked);
            }
          });
        }}
      />
    </div>
  );
}
