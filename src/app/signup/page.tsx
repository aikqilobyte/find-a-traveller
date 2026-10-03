import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Create Account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, t] = await Promise.all([searchParams, getDictionary()]);

  return (
    <AuthShell title={t.auth.createAccount} subtitle={t.auth.signUpSubtitle}>
      <OAuthButtons next={next} t={t.auth} />
      <SignupForm next={next} />
    </AuthShell>
  );
}
