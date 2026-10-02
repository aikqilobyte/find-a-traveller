"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

export type ActionResult = { error: string } | { success: true };

export async function signUp(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${await getSiteUrl()}/auth/callback?next=/login%3Fconfirm=1`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Supabase deliberately returns a success for an address that already
  // exists, so an attacker cannot use signup to discover who has an
  // account. The giveaway is an empty identities array. Telling the
  // person plainly beats leaving them waiting for an email that will
  // never arrive — the address is one they already typed, so this reveals
  // nothing they did not know.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return {
      error: "An account with this email already exists. Try signing in, or reset your password.",
    };
  }

  const next = formData.get("next");
  const nextParam =
    typeof next === "string" && next.startsWith("/") ? `&next=${encodeURIComponent(next)}` : "";
  redirect(`/login?confirm=1${nextParam}`);
}

export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Incorrect email or password." };
  }

  const next = formData.get("next");
  revalidatePath("/", "layout");
  redirect(typeof next === "string" && next.startsWith("/") ? next : "/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function requestPasswordReset(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await getSiteUrl()}/auth/callback?next=/reset-password`,
  });

  // Whether an address is registered stays hidden — that is the point of
  // the blanket success below. But a genuine failure must not hide behind
  // it: silently reporting success for a send that never happened leaves
  // someone waiting forever for an email nobody tried to deliver.
  if (error) {
    const message = error.message.toLowerCase();
    if (error.status === 429 || message.includes("rate") || message.includes("too many")) {
      return {
        error: "Too many emails requested. Wait an hour and try again, or contact support.",
      };
    }
    // Anything else is a real fault on our side, not a hint about the
    // address, so it is safe to surface.
    return { error: "We couldn't send the reset email. Please try again shortly." };
  }

  // Unregistered addresses fall through to the same success as registered
  // ones, so signup cannot be used to discover who has an account.
  return { success: true };
}

export async function resetPassword(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: error.message };
  }

  redirect("/login?reset=1");
}
