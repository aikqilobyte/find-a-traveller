"use client";

import { useActionState } from "react";
import { subscribeNewsletter } from "@/lib/actions/newsletter";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/common/submit-button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function NewsletterForm({ t }: { t: Dictionary["footer"] }) {
  const [state, formAction] = useActionState(subscribeNewsletter, null);

  if (state?.success) {
    return <p className="mt-4 text-sm font-medium text-primary-foreground">{t.subscribed}</p>;
  }

  return (
    <form action={formAction} className="mt-5 flex flex-col gap-2 sm:flex-row">
      <Input
        type="email"
        name="email"
        required
        placeholder={t.emailPlaceholder}
        className="border-0 bg-white text-foreground placeholder:text-muted-foreground"
      />
      <SubmitButton
        pendingText="Subscribing..."
        className="bg-navy text-navy-foreground hover:bg-navy/90 shrink-0"
      >
        {t.subscribe}
      </SubmitButton>
      {state && "error" in state && state.error && (
        <p className="w-full text-xs text-navy-foreground/90 sm:hidden">{state.error}</p>
      )}
    </form>
  );
}
