"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Sign in with Google or Facebook.
 *
 * Each button only appears when its provider has been configured, via
 * NEXT_PUBLIC_OAUTH_GOOGLE / NEXT_PUBLIC_OAUTH_FACEBOOK. Supabase needs a
 * client ID and secret for a provider before it will accept the call, and
 * a button that always fails is worse than no button — so the flags are
 * off until the console work is actually done.
 */
export function OAuthButtons({ next, t }: { next?: string; t: Dictionary["auth"] }) {
  const [pending, setPending] = useState<string | null>(null);

  const google = process.env.NEXT_PUBLIC_OAUTH_GOOGLE === "true";
  const facebook = process.env.NEXT_PUBLIC_OAUTH_FACEBOOK === "true";

  if (!google && !facebook) return null;

  async function signIn(provider: "google" | "facebook") {
    setPending(provider);
    const supabase = createClient();

    // Built from the live origin rather than a configured value, so the
    // same build works on any domain it is served from.
    const target = new URL("/auth/callback", window.location.origin);
    if (next?.startsWith("/")) target.searchParams.set("next", next);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: target.toString() },
    });

    if (error) {
      setPending(null);
      toast.error(t.oauthFailed);
    }
    // On success the browser is navigating away; leave the button pending.
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        {google && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={pending !== null}
            onClick={() => signIn("google")}
          >
            <GoogleMark /> {t.continueWithGoogle}
          </Button>
        )}
        {facebook && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={pending !== null}
            onClick={() => signIn("facebook")}
          >
            <FacebookMark /> {t.continueWithFacebook}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">{t.orWithEmail}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}

/* Brand marks are inlined: lucide-react dropped its brand icons, and these
   logos have usage rules that make a generic substitute a poor idea. */

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.63h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.55Z"
      />
      <path
        fill="#34A853"
        d="M12 23.5c3.11 0 5.72-1.03 7.62-2.8l-3.72-2.89c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.54-2.02-6.45-4.74H1.7v2.98A11.5 11.5 0 0 0 12 23.5Z"
      />
      <path
        fill="#FBBC05"
        d="M5.55 14.17a6.9 6.9 0 0 1 0-4.34V6.85H1.7a11.5 11.5 0 0 0 0 10.3l3.85-2.98Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.09c1.69 0 3.21.58 4.4 1.72l3.3-3.3C17.72 1.64 15.11.5 12 .5A11.5 11.5 0 0 0 1.7 6.85l3.85 2.98C6.46 7.11 9 5.09 12 5.09Z"
      />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.313 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z"
      />
    </svg>
  );
}
