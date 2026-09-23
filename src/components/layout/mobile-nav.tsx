"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { signOut } from "@/lib/actions/auth";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { FEATURES } from "@/lib/features";
import type { Profile } from "@/lib/types/database";

export function MobileNav({
  profile,
  t,
  locale,
}: {
  profile: Profile | null;
  t: Dictionary["nav"];
  locale: Locale;
}) {
  const [open, setOpen] = useState(false);

  const bagSpaceLink = FEATURES.bagSpaceMarketplace
    ? [{ href: "/find-a-traveller", label: t.exploreAsSender }]
    : [];

  const links = profile
    ? [
        { href: "/dashboard", label: t.dashboard },
        { href: "/find-a-sender", label: t.exploreAsTraveller },
        ...bagSpaceLink,
        { href: "/dashboard/offers", label: t.offers },
        { href: "/dashboard/orders", label: t.orders },
        { href: `/profile/${profile.id}`, label: t.myProfile },
      ]
    : [
        { href: "/", label: t.home },
        { href: "/find-a-sender", label: t.exploreAsTraveller },
        ...bagSpaceLink,
        { href: "/about", label: t.about },
      ];

  return (
    <div className="flex items-center gap-1 md:hidden">
      <LanguageSwitcher locale={locale} />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72">
          <SheetHeader>
            <SheetTitle>
              <Logo size="sm" href={null} />
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 px-4">
            {profile ? (
              <Button variant="outline" onClick={() => signOut()}>
                {t.signOut}
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    {t.signIn}
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    {t.joinToday}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
