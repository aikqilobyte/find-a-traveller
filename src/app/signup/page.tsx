import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create Account" };

export default function SignupPage() {
  return (
    <AuthShell title="Create your account" subtitle="Your connections are just a few steps away.">
      <SignupForm />
    </AuthShell>
  );
}
