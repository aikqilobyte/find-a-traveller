"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { changePassword } from "@/lib/actions/profile";
import type { ActionResult } from "@/lib/actions/bookings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/common/submit-button";

export function ChangePasswordForm() {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(changePassword, null);

  useEffect(() => {
    if (state && "success" in state) toast.success("Password updated");
  }, [state]);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" minLength={8} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required />
      </div>
      {state && "error" in state && <p className="text-sm text-error">{state.error}</p>}
      <SubmitButton pendingText="Updating...">Change Password</SubmitButton>
    </form>
  );
}
