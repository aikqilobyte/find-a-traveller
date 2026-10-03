import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

// Supabase email links (signup confirmation, password recovery, magic
// link) and social sign-in all redirect here with a PKCE `code`. We
// exchange it for a session server-side so the resulting cookies are set
// before the user lands on the next page.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
