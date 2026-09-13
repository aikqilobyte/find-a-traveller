import Link from "next/link";
import { Plane } from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-primary px-6 py-10 sm:px-12">
          <div className="mx-auto max-w-xl text-center">
            <h3 className="text-2xl font-semibold text-primary-foreground">Subscribe to our newsletter</h3>
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Plane className="size-5 text-primary" />
            Find a <span className="text-primary">Traveller</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            We help you find trusted travellers to bring your items from abroad. Simple, secure, and
            community-powered.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-primary">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-primary">About</Link></li>
            <li><Link href="/available-space" className="hover:text-primary">Explore Posts</Link></li>
            <li><Link href="/about#contact" className="hover:text-primary">Contact us</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-primary">Help</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-primary">Customer Support</Link></li>
            <li><Link href="/about" className="hover:text-primary">Delivery Details</Link></li>
            <li><Link href="/about" className="hover:text-primary">Terms &amp; Conditions</Link></li>
            <li><Link href="/about" className="hover:text-primary">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border bg-navy py-4 text-center text-xs text-navy-foreground/70">
        © {new Date().getFullYear()} Find A Traveller. All rights reserved.
      </div>
    </footer>
  );
}
