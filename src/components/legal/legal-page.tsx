import { AlertTriangle } from "lucide-react";

/**
 * Shared shell for the Terms and Privacy pages.
 *
 * Both carry a visible review notice. These were drafted to describe what
 * the platform actually does rather than copied from a template, but they
 * have not been checked by a lawyer, and a document that looks
 * authoritative while nobody has verified it is worse than one that admits
 * it. The notice comes out when a lawyer has signed them off.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>

      <div className="mt-6 flex gap-3 rounded-xl border border-warning/40 bg-warning-bg p-4">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
        <div className="text-sm">
          <p className="font-semibold text-foreground">Draft — pending legal review</p>
          <p className="mt-1 text-muted-foreground">
            This document describes how Find A Traveller currently works, but it has not been
            reviewed by a lawyer and is not a substitute for proper legal advice. It must be checked
            against Bangladeshi law before the platform handles real payments.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-6">{children}</div>
    </div>
  );
}

export function Clause({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
