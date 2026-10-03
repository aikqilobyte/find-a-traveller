import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getLocale } from "@/lib/i18n";
import { buildSystemPrompt } from "@/lib/support/knowledge";

/**
 * The support assistant.
 *
 * Grounded in the help content and nothing else — it is given no database
 * access at all, so it cannot reveal a name the product is deliberately
 * hiding until payment, and cannot invent a fee or a policy. Every answer
 * it can give is one somebody wrote.
 */

const MODEL = "claude-opus-5-5";

/** Short answers only; a support reply that needs more is a job for a person. */
const MAX_TOKENS = 700;

/** Cap the conversation so a long thread cannot run up a bill on one session. */
const MAX_TURNS = 12;
const MAX_CHARS = 1000;

/**
 * Per-IP throttle. In memory, so it resets on deploy and is per-process —
 * enough to stop one person looping the endpoint, not a defence against a
 * distributed attack. Worth replacing with a shared store if the app ever
 * runs more than one instance.
 */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 20;
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

interface Turn {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let turns: Turn[];
  try {
    const body = await request.json();
    turns = Array.isArray(body?.messages) ? body.messages : [];
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const cleaned = turns
    .filter((t) => (t.role === "user" || t.role === "assistant") && typeof t.content === "string")
    .slice(-MAX_TURNS)
    .map((t) => ({ role: t.role, content: t.content.slice(0, MAX_CHARS) }));

  if (cleaned.length === 0 || cleaned[cleaned.length - 1].role !== "user") {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const locale = await getLocale();

  try {
    const response = await new Anthropic().messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // Low effort: these are short answers read from a reference, not
      // problems to reason through, and this is a free support channel.
      output_config: { effort: "low" },
      system: buildSystemPrompt(locale),
      messages: cleaned,
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({ error: "declined" }, { status: 200 });
    }

    const answer = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    // Logged so the questions people actually ask can be read back later —
    // the fastest way to learn what the help page is missing.
    console.log(
      `[support-chat] ${locale} | q=${JSON.stringify(cleaned[cleaned.length - 1].content.slice(0, 160))}`,
    );

    return NextResponse.json({ answer: answer || null });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    console.error("[support-chat] failed", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
