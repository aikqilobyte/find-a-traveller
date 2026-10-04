import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Only allow redirects to a path on this site. `next` arrives from a URL
 * anybody can craft and mail to someone, so a value like "//evil.com" or a
 * backslash variant must not be able to bounce a freshly signed-in user off
 * the site with their session already established.
 */
function safeNext(value: string | null): string {
  if (!value) return "/dashboard";
  if (!value.startsWith("/")) return "/dashboard";
  // "//host" and "/\host" are both read as another origin by browsers.
  if (value.startsWith("//") || value.startsWith("/\\")) return "/dashboard";
  return value;
}

/**
 * Lands every auth round-trip: email confirmation, password recovery and
 * social sign-in.
 *
 * Two different mechanisms arrive here and both have to work.
 *
 * `code` is PKCE. The matching verifier lives in a cookie in the browser
 * that started the flow, so it only completes in that same browser. That
 * is right for social sign-in, which begins and ends in one tab, and it is
 * exactly wrong for email: people sign up on a laptop and open the mail on
 * their phone, where no verifier exists, and the exchange fails.
 *
 * `token_hash` carries its own proof and needs no cookie, so it works from
 * whatever device opened the message. Email templates should use it.
 *
 * Redirects are built from getSiteUrl(), never from this request's own
 * origin. Behind a proxy that does not forward the Host header, Next sees
 * the request as arriving at localhost:3000 — the port it listens on — and
 * every redirect then sends the visitor to their own machine. That is not
 * hypothetical: it is what shipped, and the auth emails were only where it
 * happened to become visible.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = await getSiteUrl();
  const next = safeNext(searchParams.get("next"));

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${base}${next}`);
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${base}${next}`);
    }
  }

  return NextResponse.redirect(`${base}/login?error=auth_callback_failed`);
}
