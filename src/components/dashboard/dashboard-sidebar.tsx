"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Handshake,
  MessageSquare,
  Bell,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const links = (t: Dictionary["dashboard"]) => [
  { href: "/dashboard", label: t.overview, icon: LayoutDashboard, exact: true },
  { href: "/dashboard/posts", label: t.myPosts, icon: Package },
  { href: "/dashboard/orders", label: t.myOrders, icon: ClipboardList },
  { href: "/dashboard/offers", label: t.offers, icon: Handshake },
  { href: "/dashboard/messages", label: t.messages, icon: MessageSquare },
  { href: "/dashboard/notifications", label: t.notifications, icon: Bell },
  { href: "/dashboard/profile", label: t.profile, icon: UserRound },
];

export function DashboardSidebar({ t }: { t: Dictionary["dashboard"] }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto lg:w-56 lg:flex-col lg:overflow-visible">
      {links(t).map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
            )}
          >
            <link.icon className="size-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
