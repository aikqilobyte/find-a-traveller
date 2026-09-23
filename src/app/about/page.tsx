import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ShieldCheck, Globe2, Users } from "lucide-react";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  const t = await getDictionary();

  const pillars = [
    { icon: ShieldCheck, title: t.about.trustTitle, body: t.about.trustBody },
    { icon: Globe2, title: t.about.reachTitle, body: t.about.reachBody },
    { icon: Users, title: t.about.communityTitle, body: t.about.communityBody },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-surface-muted">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-semibold text-foreground">{t.about.title}</h1>
            <p className="mt-4 text-muted-foreground">{t.about.intro}</p>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-6 px-4 py-16 sm:grid-cols-3 sm:px-6 lg:px-8">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-2xl border border-border bg-surface p-6 text-center">
              <pillar.icon className="mx-auto size-8 text-primary" />
              <h3 className="mt-3 font-semibold text-foreground">{pillar.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{pillar.body}</p>
            </div>
          ))}
        </section>

        <section id="contact" className="mx-auto max-w-3xl px-4 pb-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-foreground">{t.about.contactTitle}</h2>
          <p className="mt-2 text-muted-foreground">
            {t.about.contactBody}{" "}
            <a href="mailto:support@findatraveller.example" className="text-primary hover:underline">
              support@findatraveller.example
            </a>
            .
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
