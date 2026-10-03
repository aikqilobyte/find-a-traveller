"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, X, ChevronLeft, ArrowRight, Sparkles, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * A help widget that answers from a written list rather than a model.
 *
 * Deliberately not an AI assistant: this sits on a page where people are
 * about to hand a stranger their belongings, and a confident wrong answer
 * about escrow or the delivery code would do real harm. Every answer here
 * is one somebody wrote, and it is the same text as the help page — one
 * source, so the two cannot drift apart.
 */
export function HelpWidget({ t }: { t: Dictionary["help"] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [mode, setMode] = useState<"list" | "ask">("list");
  const [chat, setChat] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function ask() {
    const question = draft.trim();
    if (!question || busy) return;

    const next = [...chat, { role: "user" as const, content: question }];
    setChat(next);
    setDraft("");
    setNotice(null);
    setBusy(true);

    try {
      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();

      if (res.status === 503) setNotice(t.askUnavailable);
      else if (res.status === 429) setNotice(t.askLimited);
      else if (!res.ok || !data.answer) setNotice(t.askFailed);
      else setChat([...next, { role: "assistant", content: data.answer }]);
    } catch {
      setNotice(t.askFailed);
    } finally {
      setBusy(false);
    }
  }

  const questions = [
    { q: t.q1, a: t.a1 },
    { q: t.q2, a: t.a2 },
    { q: t.q3, a: t.a3 },
    { q: t.q4, a: t.a4 },
    { q: t.q5, a: t.a5 },
    { q: t.q6, a: t.a6 },
    { q: t.q7, a: t.a7 },
    { q: t.q8, a: t.a8 },
    { q: t.q9, a: t.a9 },
    { q: t.q10, a: t.a10 },
  ];

  if (!open) {
    return (
      <button
        type="button"
        aria-label={t.widgetOpen}
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <MessageCircle className="size-5" />
      </button>
    );
  }

  const selected = active === null ? null : questions[active];

  return (
    <div
      className={cn(
        "fixed z-40 flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl",
        // Full width on a phone, a panel on anything larger.
        "inset-x-3 bottom-3 max-h-[75vh] sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-[22rem]",
      )}
      role="dialog"
      aria-label={t.widgetTitle}
    >
      <div className="flex items-center justify-between gap-2 bg-primary px-4 py-3 text-primary-foreground">
        {selected || mode === "ask" ? (
          <button
            type="button"
            onClick={() => {
              setActive(null);
              setMode("list");
            }}
            className="flex items-center gap-1 text-sm font-medium hover:underline"
          >
            <ChevronLeft className="size-4" /> {t.widgetBack}
          </button>
        ) : (
          <p className="text-sm font-semibold">{t.widgetTitle}</p>
        )}
        <button
          type="button"
          aria-label={t.widgetClose}
          onClick={() => {
            setOpen(false);
            setActive(null);
          }}
          className="shrink-0 rounded p-1 hover:bg-white/10"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {mode === "ask" ? (
          <>
            <p className="text-sm text-muted-foreground">{t.askIntro}</p>
            <div className="mt-3 space-y-3">
              {chat.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-surface-muted text-foreground",
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              ))}
              {busy && <p className="text-sm text-muted-foreground">{t.askThinking}</p>}
              {notice && (
                <p className="rounded-lg bg-warning-bg px-3 py-2 text-xs text-warning">{notice}</p>
              )}
            </div>
          </>
        ) : selected ? (
          <>
            <p className="text-sm font-semibold text-foreground">{selected.q}</p>
            <p className="mt-2 text-sm text-muted-foreground">{selected.a}</p>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{t.widgetGreeting}</p>
            <ul className="mt-3 space-y-1.5">
              {questions.map((item, i) => (
                <li key={item.q}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    {item.q}
                  </button>
                </li>
              ))}
            </ul>
            {/* The way out of a fixed list: anything not covered above goes
                to the assistant, which answers from the same material. */}
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => setMode("ask")}
            >
              <Sparkles /> {t.askOther}
            </Button>
          </>
        )}
      </div>

      <div className="border-t border-border p-3">
        {mode === "ask" ? (
          <>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void ask();
              }}
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t.askPlaceholder}
                maxLength={1000}
                disabled={busy}
              />
              <Button type="submit" size="icon" disabled={busy || !draft.trim()}>
                <Send className="size-4" />
              </Button>
            </form>
            <p className="mt-2 text-[10px] leading-tight text-muted-foreground">{t.askDisclaimer}</p>
          </>
        ) : (
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/help" onClick={() => setOpen(false)}>
              {t.widgetMore} <ArrowRight />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
