import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Reset Password" };

export default async function ResetPasswordPage() {
  const t = await getDictionary();
  return (
    <AuthShell title={t.auth.resetTitle} subtitle={t.auth.resetSubtitle}>
      <ResetPasswordForm />
    </AuthShell>
  );
}
