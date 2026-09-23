import Link from "next/link";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { Logo } from "@/components/layout/logo";
import { getDictionary } from "@/lib/i18n";

export async function Footer() {
  const t = await getDictionary();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-primary px-6 py-10 sm:px-12">
          <div className="mx-auto max-w-xl text-center">
            <h3 className="text-2xl font-semibold text-primary-foreground">{t.footer.newsletter}</h3>
            <NewsletterForm t={t.footer} />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">{t.footer.tagline}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-primary">{t.footer.company}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-primary">{t.footer.about}</Link></li>
            <li><Link href="/find-a-sender" className="hover:text-primary">{t.footer.browsePackages}</Link></li>
            <li><Link href="/dashboard/posts/new/package" className="hover:text-primary">{t.footer.postPackage}</Link></li>
            <li><Link href="/about#contact" className="hover:text-primary">{t.footer.contact}</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-primary">{t.footer.help}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-primary">{t.footer.support}</Link></li>
            <li><Link href="/about" className="hover:text-primary">{t.footer.delivery}</Link></li>
            <li><Link href="/about" className="hover:text-primary">{t.footer.terms}</Link></li>
            <li><Link href="/about" className="hover:text-primary">{t.footer.privacy}</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border bg-navy py-4 text-center text-xs text-navy-foreground/70">
        © {new Date().getFullYear()} Find A Traveller. {t.footer.rights}
      </div>
    </footer>
  );
}
