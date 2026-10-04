"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createShipRequestSchema } from "@/lib/validations/posts";
import { guestPosterSchema } from "@/lib/validations/posts";
import { getSiteUrl } from "@/lib/site-url";
import { friendlyError } from "@/lib/actions/errors";
import type { ActionResult } from "@/lib/actions/bookings";

/**
 * Posting a package without an account.
 *
 * A post still needs an owner: ship_requests.shopper_id is not nullable,
 * offers have to reach somebody, and escrow has to have a party to pay.
 * So the account is created from the email rather than skipped — the
 * person never sees a sign-in form, but the post has a real owner and we
 * can tell them when an offer arrives.
 *
 * Runs service-role because the poster has no session to act under. Every
 * value written here comes from the validated form, never from the client
 * choosing an owner.
 */

/** Per-IP cap. In memory, so it resets on deploy and is per-process — enough
 *  to stop a script filling the board, not a defence against a botnet. */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function parseCategoryIds(formData: FormData) {
  return formData.getAll("categoryIds").map(String).filter(Boolean);
}

export async function createGuestShipRequest(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown";

  if (rateLimited(ip)) {
    return { error: "That's a lot of posts at once. Please try again later." };
  }

  const poster = guestPosterSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
  });
  if (!poster.success) {
    return { error: poster.error.issues[0]?.message ?? "Check your name and email" };
  }

  const parsed = createShipRequestSchema.safeParse({
    originCountry: formData.get("originCountry"),
    originCity: formData.get("originCity"),
    destinationCountry: formData.get("destinationCountry"),
    destinationCity: formData.get("destinationCity"),
    itemDescription: formData.get("itemDescription"),
    quantity: formData.get("quantity") || 1,
    weightKg: formData.get("weightKg"),
    itemValueUsd: formData.get("itemValueUsd") || 0,
    deadline: formData.get("deadline") || undefined,
    proposedPaymentUsd: formData.get("proposedPaymentUsd"),
    transportPreference: formData.get("transportPreference") || undefined,
    notes: formData.get("notes") || undefined,
    categoryIds: parseCategoryIds(formData),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const admin = createAdminClient();

  // Create the owner, or find the existing one.
  const created = await admin.auth.admin.createUser({
    email: poster.data.email,
    email_confirm: false,
    user_metadata: { full_name: poster.data.fullName },
  });

  let ownerId = created.data.user?.id ?? null;

  // An address that already has an account belongs to somebody who is not
  // necessarily the person filling this form. Their post is held as a
  // draft that only they can publish, so a stranger cannot put a live
  // listing under their name.
  const addressAlreadyRegistered = !ownerId;

  if (!ownerId) {
    const { data: existing } = await admin
      .from("profiles")
      .select("id")
      .eq("email", poster.data.email)
      .maybeSingle();
    ownerId = (existing as { id: string } | null)?.id ?? null;
  }

  if (!ownerId) {
    return { error: friendlyError(created.error?.message ?? "") };
  }

  const { data: request, error } = await admin
    .from("ship_requests")
    .insert({
      shopper_id: ownerId,
      origin_country: parsed.data.originCountry,
      origin_city: parsed.data.originCity,
      destination_country: parsed.data.destinationCountry,
      destination_city: parsed.data.destinationCity,
      item_description: parsed.data.itemDescription,
      quantity: parsed.data.quantity,
      weight_kg: parsed.data.weightKg,
      item_value_cents: parsed.data.itemValueUsd,
      deadline: parsed.data.deadline || null,
      proposed_payment_cents: parsed.data.proposedPaymentUsd,
      transport_preference: parsed.data.transportPreference || null,
      notes: parsed.data.notes || null,
      status: addressAlreadyRegistered ? "draft" : "active",
    })
    .select("id")
    .single();

  if (error || !request) {
    return { error: friendlyError(error?.message ?? "") };
  }

  if (parsed.data.categoryIds.length > 0) {
    await admin.from("ship_request_categories").insert(
      parsed.data.categoryIds.map((categoryId) => ({
        request_id: (request as { id: string }).id,
        category_id: categoryId,
      })),
    );
  }

  // The way back in. No password is ever set, so this link is how the
  // poster reaches their own post and the offers on it.
  const base = await getSiteUrl();
  await admin.auth.admin.generateLink({
    type: "magiclink",
    email: poster.data.email,
    options: { redirectTo: `${base}/auth/callback?next=/dashboard/posts` },
  });

  return { success: true, data: undefined };
}
