import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, Eye, Scale, Ban } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Delivery Details" };

export default async function DeliveryPage() {
  const t = await getDictionary();

  const steps = [
    t.delivery.step1,
    t.delivery.step2,
    t.delivery.step3,
    t.delivery.step4,
    t.delivery.step5,
    t.delivery.step6,
    t.delivery.step7,
    t.delivery.step8,
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-surface-muted">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-semibold text-foreground">{t.delivery.title}</h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t.delivery.intro}</p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-semibold text-foreground">{t.delivery.stepsTitle}</h2>
            <ol className="mt-4 space-y-3">
              {steps.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <Card icon={KeyRound} title={t.delivery.codeTitle}>
            <p>{t.delivery.codeBody}</p>
          </Card>

          <Card icon={Eye} title={t.delivery.inspectTitle}>
            <p>{t.delivery.inspectBody}</p>
          </Card>

          <Card icon={Scale} title={t.delivery.limitsTitle}>
            <p>{t.delivery.limitsBody}</p>
          </Card>

          <Card icon={Ban} title={t.delivery.prohibitedTitle}>
            <p>{t.delivery.prohibitedBody}</p>
            <Link href="/terms" className="mt-2 inline-block font-medium text-primary hover:underline">
              {t.footer.terms}
            </Link>
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
