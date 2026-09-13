import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; confirm?: string; reset?: string }>;
}) {
  const { next, confirm, reset } = await searchParams;

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue to your dashboard.">
      {confirm && (
        <p className="rounded-lg bg-info-bg px-3 py-2 text-sm text-info">
          Check your email to confirm your account, then sign in.
        </p>
      )}
      {reset && (
        <p className="rounded-lg bg-success-bg px-3 py-2 text-sm text-success">
          Your password has been updated. Sign in with your new password.
        </p>
      )}
      <LoginForm next={next} />
    </AuthShell>
  );
}
