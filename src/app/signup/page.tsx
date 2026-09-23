import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
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
      <SignupForm next={next} />
    </AuthShell>
  );
}
