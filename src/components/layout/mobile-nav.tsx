"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Plane } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import type { Profile } from "@/lib/types/database";

export function MobileNav({ profile }: { profile: Profile | null }) {
  const [open, setOpen] = useState(false);

  const links = profile
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/available-space", label: "Available Space" },
        { href: "/ship-requests", label: "Ship Requests" },
        { href: "/dashboard/offers", label: "Offers" },
        { href: "/dashboard/orders", label: "Orders" },
        { href: "/travel-buddy", label: "Travel Buddy" },
        { href: `/profile/${profile.id}`, label: "My Profile" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/available-space", label: "Available Space" },
        { href: "/ship-requests", label: "Ship Requests" },
        { href: "/travel-buddy", label: "Travel Buddy" },
        { href: "/about", label: "About us" },
      ];

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-primary">
              <Plane className="size-5" /> Find a Traveller
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
                Sign out
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    Join Today
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
