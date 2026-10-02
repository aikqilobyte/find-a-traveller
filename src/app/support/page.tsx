import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ListChecks, ShieldAlert, Flag } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Customer Support" };

export default async function SupportPage() {
  const t = await getDictionary();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-surface-muted">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-semibold text-foreground">{t.support.title}</h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t.support.intro}</p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
          <Card icon={Mail} title={t.support.contactTitle}>
            <p>{t.support.contactBody}</p>
            <Link href="/about#contact" className="mt-2 inline-block font-medium text-primary hover:underline">
              {t.footer.contact}
            </Link>
          </Card>

          <Card icon={ListChecks} title={t.support.includeTitle}>
            <ul className="list-disc space-y-1 pl-5">
              <li>{t.support.include1}</li>
              <li>{t.support.include2}</li>
              <li>{t.support.include3}</li>
            </ul>
          </Card>

          {/* The one that actually saves money, so it gets the warning styling. */}
          <div className="rounded-2xl border border-warning/40 bg-warning-bg p-5">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldAlert className="size-5 shrink-0 text-warning" /> {t.support.urgentTitle}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t.support.urgentBody}</p>
          </div>

          <Card icon={Flag} title={t.support.safetyTitle}>
            <p>{t.support.safetyBody}</p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="flex items-center gap-2 font-semibold text-foreground">
        <Icon className="size-5 shrink-0 text-primary" /> {title}
      </h2>
      <div className="mt-2 space-y-2 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}
