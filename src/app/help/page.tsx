import type { Metadata } from "next";
import Link from "next/link";
import { Package, Plane, ShieldCheck, PlayCircle, Mail } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Help Centre" };

/**
 * The footer has advertised Help and Customer Support since launch, with
 * both pointing at the About page — which answers none of it. This is the
 * page those links were always promising.
 *
 * Answers are grouped by what the reader is trying to do rather than by
 * feature, because someone with a problem knows which side of the deal
 * they are on, not which part of the system it belongs to.
 */
export default async function HelpPage() {
  const t = await getDictionary();

  const sections = [
    {
      icon: Package,
      title: t.help.forOwnersTitle,
      items: [
        { q: t.help.q1, a: t.help.a1 },
        { q: t.help.q2, a: t.help.a2 },
        { q: t.help.q6, a: t.help.a6 },
      ],
    },
    {
      icon: Plane,
      title: t.help.forTravellersTitle,
      items: [
        { q: t.help.q7, a: t.help.a7 },
        { q: t.help.q8, a: t.help.a8 },
      ],
    },
    {
      icon: ShieldCheck,
      title: t.help.safetyTitle,
      items: [
        { q: t.help.q3, a: t.help.a3 },
        { q: t.help.q4, a: t.help.a4 },
        { q: t.help.q5, a: t.help.a5 },
        { q: t.help.q9, a: t.help.a9 },
        { q: t.help.q10, a: t.help.a10 },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-surface-muted">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-semibold text-foreground">{t.help.title}</h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t.help.intro}</p>
          </div>
        </section>

        {/* Walkthrough video. Deliberately a placeholder rather than an
            empty embed: there is nothing to play until one is recorded,
            and a dead player reads worse than an honest note. Replace the
            block below with the YouTube iframe once the video exists. */}
        <section className="mx-auto max-w-3xl px-4 pt-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-dashed border-border bg-surface-muted/50 p-8 text-center">
            <PlayCircle className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-3 font-semibold text-foreground">{t.help.videoTitle}</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              {t.help.videoComingSoon}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                <section.icon className="size-5 shrink-0 text-primary" />
                {section.title}
              </h2>
              <div className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border bg-surface p-4 open:shadow-sm"
                  >
                    <summary className="cursor-pointer list-none font-medium text-foreground marker:hidden">
                      {item.q}
                    </summary>
                    <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <Mail className="mx-auto size-6 text-primary" />
            <h2 className="mt-2 text-lg font-semibold text-foreground">{t.help.stillStuckTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.help.stillStuckBody}</p>
            <Link
              href="/about#contact"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              {t.footer.contact}
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
