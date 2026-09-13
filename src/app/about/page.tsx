import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ShieldCheck, Globe2, Users } from "lucide-react";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-surface-muted">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-semibold text-foreground">About Find A Traveller</h1>
            <p className="mt-4 text-muted-foreground">
              Find A Traveller is a peer-to-peer marketplace that connects people who need to send or obtain
              products with travellers who have available luggage capacity. We believe every trip has unused
              value — and every shipment deserves a trusted, real person carrying it.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-6 px-4 py-16 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-surface p-6 text-center">
            <ShieldCheck className="mx-auto size-8 text-primary" />
            <h3 className="mt-3 font-semibold text-foreground">Trust &amp; Safety</h3>
            <p className="mt-1 text-sm text-muted-foreground">Identity verification, secure payments, and a two-way review system.</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 text-center">
            <Globe2 className="mx-auto size-8 text-primary" />
            <h3 className="mt-3 font-semibold text-foreground">Global Reach</h3>
            <p className="mt-1 text-sm text-muted-foreground">Connecting shoppers and travellers across borders, one trip at a time.</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 text-center">
            <Users className="mx-auto size-8 text-primary" />
            <h3 className="mt-3 font-semibold text-foreground">Community Powered</h3>
            <p className="mt-1 text-sm text-muted-foreground">Every listing, request, and review comes from real members of our community.</p>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-3xl px-4 pb-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-foreground">Contact us</h2>
          <p className="mt-2 text-muted-foreground">
            Questions or feedback? Reach our support team any time at{" "}
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
