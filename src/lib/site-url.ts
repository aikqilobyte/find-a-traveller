import { headers } from "next/headers";

function withoutTrailingSlash(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * Absolute origin for links that leave the app — Supabase auth emails in
 * particular, where a wrong value is invisible until a real user clicks a
 * dead confirmation link.
 *
 * NEXT_PUBLIC_SITE_URL wins, so a canonical custom domain can be forced.
 * But a localhost value is only ever right while the request is itself
 * local: left in a deployed environment it would mail every new user a
 * link to their own machine. Unset, it would previously interpolate as
 * the literal string "undefined". Both fall back to the request's own
 * origin, which is always where the user actually is.
 */
export async function getSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const fromRequest = host ? `${protocol}://${host}` : null;

  const configuredIsLocal = !!configured && /^https?:\/\/(localhost|127\.0\.0\.1)/.test(configured);
  const requestIsLocal = !!host && /^(localhost|127\.0\.0\.1)/.test(host);
  if (configured && (!configuredIsLocal || requestIsLocal)) return withoutTrailingSlash(configured);
  if (fromRequest) return withoutTrailingSlash(fromRequest);

  // Nothing usable: no host header, and the only configured value points at
  // a machine the recipient of this link does not have. Say so loudly —
  // this is otherwise invisible until a real person clicks a dead link in
  // an email, which is a terrible place to discover it.
  if (configuredIsLocal) {
    console.warn(
      `[site-url] About to build an email link against ${configured}, which is localhost, ` +
        `and no host header was available to correct it. Set NEXT_PUBLIC_SITE_URL to the ` +
        `deployed domain — every auth email sent from here points at the recipient's own machine.`,
    );
  }

  return withoutTrailingSlash(configured ?? "http://localhost:3000");
}
