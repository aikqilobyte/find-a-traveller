"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ email: z.string().email() });

export async function subscribeNewsletter(_prev: { error?: string; success?: boolean } | null, formData: FormData) {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({ email: parsed.data.email });

  if (error && !error.message.includes("duplicate")) {
    return { error: "Something went wrong. Please try again." };
  }

  return { success: true };
}
