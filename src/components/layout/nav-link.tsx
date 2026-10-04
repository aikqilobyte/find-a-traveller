"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * A top-level navigation link.
 *
 * Changing only the text colour on hover gives no sense that the item is a
 * target — the pointer lands on a word rather than a control. A padded
 * surface that lifts on hover, plus a held state for the page you are
 * actually on, is most of what reads as considered in a header.
 */
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  // "/" would otherwise prefix-match every route.
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
        active
          ? "bg-primary/10 text-primary"
          : "text-foreground hover:bg-surface-muted hover:text-primary",
      )}
    >
      {children}
    </Link>
  );
}
