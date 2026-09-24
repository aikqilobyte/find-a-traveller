import { describe, it, expect, vi, beforeEach } from "vitest";

const headerValues = new Map<string, string>();

vi.mock("next/headers", () => ({
  headers: async () => ({ get: (key: string) => headerValues.get(key) ?? null }),
}));

import { getSiteUrl } from "./site-url";

function request(headers: Record<string, string>) {
  headerValues.clear();
  for (const [key, value] of Object.entries(headers)) headerValues.set(key, value);
}

describe("getSiteUrl", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    headerValues.clear();
  });

  it("uses the configured site url", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://findatraveller.com";
    request({ host: "findatraveller.netlify.app", "x-forwarded-proto": "https" });
    expect(await getSiteUrl()).toBe("https://findatraveller.com");
  });

  it("drops a trailing slash so links don't end up with a double slash", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://findatraveller.com/";
    expect(await getSiteUrl()).toBe("https://findatraveller.com");
  });

  // The failure this guards against: the env var is never set in the
  // deploy, every confirmation email links to "undefined/auth/callback"
  // and nobody can finish signing up.
  it("falls back to the request origin when nothing is configured", async () => {
    request({ host: "findatraveller.netlify.app", "x-forwarded-proto": "https" });
    expect(await getSiteUrl()).toBe("https://findatraveller.netlify.app");
  });

  // The other failure: .env.local's localhost value gets copied into the
  // deploy, and new users are mailed a link to their own machine.
  it("ignores a localhost setting when the request is not local", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    request({ host: "findatraveller.netlify.app", "x-forwarded-proto": "https" });
    expect(await getSiteUrl()).toBe("https://findatraveller.netlify.app");
  });

  it("keeps localhost while developing locally", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    request({ host: "localhost:3000" });
    expect(await getSiteUrl()).toBe("http://localhost:3000");
  });

  it("prefers the forwarded host behind a proxy", async () => {
    request({ host: "internal.netlify.internal", "x-forwarded-host": "findatraveller.com", "x-forwarded-proto": "https" });
    expect(await getSiteUrl()).toBe("https://findatraveller.com");
  });
});
