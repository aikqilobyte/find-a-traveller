import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, KeyRound, MessageSquareText, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSearch } from "@/components/marketing/hero-search";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { TravellerCard } from "@/components/marketplace/traveller-card";
import type { TravellerPost } from "@/lib/types/database";

const SERVICES = [
  {
    title: "Ship & Shop",
    description: "Help others get products from different countries while earning.",
    href: "/ship-requests",
  },
  {
    title: "Luggage Sharing",
    description: "Monetize your unused luggage space on every trip you take.",
    href: "/available-space",
  },
  {
    title: "Travel Buddy",
    description: "Meet like-minded travellers and explore together.",
    href: "/travel-buddy",
  },
];

const SAFETY_FEATURES = [
  {
    icon: ShieldCheck,
    title: "Identity Verification",
    description: "Tell us what you need, from where, and when you want it delivered.",
  },
  {
    icon: KeyRound,
    title: "Secure Payment",
    description: "Get matched with a verified traveller and pay securely through our system.",
  },
  {
    icon: MessageSquareText,
    title: "Review System",
    description: "Your traveller brings the item to you — track your order and stay in touch until it arrives.",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: featuredPosts } = await supabase
    .from("traveller_posts")
    .select("*, traveller:profiles(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-surface-muted">
          <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Trusted Travellers Make Your <span className="text-primary">Shopping, Shipping &amp; Sharing</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Whether you need to shop, send, receive, share luggage, or find a travel buddy, locally or
              globally — we&apos;ll connect you with a verified, trusted traveller.
            </p>
            <div className="mt-8">
              <HeroSearch />
            </div>
          </div>
        </section>

        {/* What will you get */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-foreground">What will you get from us?</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Get access to a smart travel network where you can earn by sharing luggage, receive products
              through trusted travellers, and connect with travel buddies.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {SERVICES.map((service) => (
              <div key={service.title} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
                <Button asChild className="mt-5 w-full">
                  <Link href={service.href}>
                    Get Started <ArrowRight />
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
              Your <span className="text-primary">safety</span> is our priority
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-navy-foreground/70">
              Advanced verification, secure payments, and comprehensive insurance make every transaction
              safe and worry-free.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {SAFETY_FEATURES.map((feature) => (
                <div key={feature.title} className="rounded-xl bg-white/5 p-5 text-left">
                  <feature.icon className="size-8 rounded-full bg-primary/20 p-1.5 text-primary" />
                  <h3 className="mt-3 font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-navy-foreground/70">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Luggage sharing feature */}
        <FeatureRow
          eyebrow="Luggage Sharing"
          title="Need Extra Bag Space?"
          description="Whether you're a frequent flyer or occasional traveller, Find A Traveller helps you maximize your travel experience while earning extra income."
          bullets={["Save on Shipping", "Trusted & Secure", "Fast & Flexible"]}
          cta={{ label: "Register As Traveller", href: "/signup" }}
          imageSrc="https://images.unsplash.com/photo-1553531384-cc64ac80f931?q=80&w=1200&auto=format&fit=crop"
          imageAlt="Traveller handing over luggage"
        />

        {/* Ship & shop feature */}
        <FeatureRow
          reverse
          eyebrow="Item Delivery"
          title="Send With Peace of Mind"
          description="Get products from anywhere in the world, delivered by real travellers already heading your way — faster and cheaper than traditional couriers."
          bullets={["Faster Shipping", "Save Money", "Border Access"]}
          cta={{ label: "Register As Shopper", href: "/signup" }}
          imageSrc="https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=1200&auto=format&fit=crop"
          imageAlt="Courier holding a package"
        />

        {/* Travel buddy feature */}
        <FeatureRow
          eyebrow="Travel Buddy"
          title="Never Travel Alone Again."
          description="Find people travelling your route and dates. Meet new people, stay safe, and make your trip more affordable and enjoyable."
          bullets={["Earn money", "Meet New People", "Affordable Travel"]}
          cta={{ label: "Register As Traveller", href: "/signup" }}
          imageSrc="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&auto=format&fit=crop"
          imageAlt="Traveller smiling with luggage"
        />

        {/* Marketplace preview */}
        {featuredPosts && featuredPosts.length > 0 && (
          <section className="bg-surface-muted py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-semibold text-foreground">Your travel, their treasure</h2>
                <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
                  Travellers earn by delivering items on their route. Shoppers get global products without
                  the high shipping fees.
                </p>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(featuredPosts as unknown as TravellerPost[]).map((post) => (
                  <TravellerCard key={post.id} post={post} />
                ))}
              </div>
              <div className="mt-8 text-center">
                <Button asChild size="lg">
                  <Link href="/available-space">
                    Explore All <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}
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
