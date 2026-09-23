import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, KeyRound, MessageSquareText, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSearch } from "@/components/marketing/hero-search";
import { Button } from "@/components/ui/button";
import { FEATURES } from "@/lib/features";
import { getDictionary } from "@/lib/i18n";


export default async function HomePage() {
  const t = await getDictionary();

  const services = [
    {
      title: t.home.sendingTitle,
      description: t.home.sendingBody,
      cta: t.home.sendingCta,
      href: FEATURES.bagSpaceMarketplace ? "/find-a-traveller" : "/dashboard/posts/new/package",
    },
    {
      title: t.home.travellingTitle,
      description: t.home.travellingBody,
      cta: t.home.travellingCta,
      href: "/find-a-sender",
    },
  ];

  const safetyFeatures = [
    { icon: ShieldCheck, title: t.home.identityTitle, description: t.home.identityBody },
    { icon: KeyRound, title: t.home.paymentTitle, description: t.home.paymentBody },
    { icon: MessageSquareText, title: t.home.reviewTitle, description: t.home.reviewBody },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-surface-muted">
          <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {t.home.heroTitle} <span className="text-primary">{t.home.heroTitleAccent}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{t.home.heroSubtitle}</p>
            <div className="mt-8">
              <HeroSearch t={t.search} />
            </div>
          </div>
        </section>

        {/* What will you get */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-foreground">{t.home.howItWorks}</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">{t.home.howItWorksSubtitle}</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
            {services.map((service) => (
              <div key={service.title} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
                <Button asChild className="mt-5 w-full">
                  <Link href={service.href}>
                    {service.cta} <ArrowRight />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Safety */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-navy px-6 py-14 text-center text-navy-foreground sm:px-14">
            <h2 className="text-3xl font-semibold">
              {t.home.safetyTitle} <span className="text-primary">{t.home.safetyTitleAccent}</span>{" "}
              {t.home.safetyTitleEnd}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-navy-foreground/70">{t.home.safetySubtitle}</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {safetyFeatures.map((feature) => (
                <div key={feature.title} className="rounded-xl bg-white/5 p-5 text-left">
                  <feature.icon className="size-8 rounded-full bg-primary/20 p-1.5 text-primary" />
                  <h3 className="mt-3 font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-navy-foreground/70">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* "Need Extra Bag Space?" / For Travellers lives behind the
            bagSpaceMarketplace flag — it advertises renting luggage space,
            which is not part of this launch. */}
        {FEATURES.bagSpaceMarketplace && (
          <FeatureRow
            eyebrow="For Travellers"
            title="Need Extra Bag Space?"
            description="Whether you're a frequent flyer or an occasional traveller, Find A Traveller turns the luggage allowance you aren't using into extra income on trips you're already taking."
            bullets={["Earn on every trip", "Verified receivers only", "You choose what you carry"]}
            cta={{ label: "Post Your Trip", href: "/dashboard/posts/new/trip" }}
            imageSrc="https://images.unsplash.com/photo-1553531384-cc64ac80f931?q=80&w=1200&auto=format&fit=crop"
            imageAlt="Traveller handing over luggage"
          />
        )}

        {/* Receiver feature */}
        <FeatureRow
          reverse
          eyebrow="For Receivers"
          title="Receive with Peace of Mind"
          description="Get your package delivered by a real traveller already heading your way — faster and cheaper than traditional couriers, with your payment protected until it arrives."
          bullets={["Faster than courier", "Save money", "Payment held until delivery"]}
          cta={{ label: "Post Your Package", href: "/dashboard/posts/new/package" }}
          imageSrc="https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=1200&auto=format&fit=crop"
          imageAlt="Courier holding a package"
        />
      </main>
      <Footer />
    </div>
  );
}

function FeatureRow({
  eyebrow,
  title,
  description,
  bullets,
  cta,
  imageSrc,
  imageAlt,
  reverse,
}: {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  cta: { label: string; href: string };
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className={`grid items-center gap-10 md:grid-cols-2 ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
        <div>
          <p className="text-sm font-semibold text-primary">{eyebrow}</p>
          <h2 className="mt-1 text-3xl font-semibold text-foreground">{title}</h2>
          <p className="mt-3 text-muted-foreground">{description}</p>
          <ul className="mt-4 space-y-2">
            {bullets.map((bullet) => (
              <li key={bullet} className="text-sm font-medium text-primary">
                {bullet}
              </li>
            ))}
          </ul>
          <Button asChild className="mt-6">
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-muted">
          <Image src={imageSrc} alt={imageAlt} fill className="object-cover" unoptimized />
        </div>
      </div>
    </section>
  );
}
