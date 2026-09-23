"use client";

import Link from "next/link";
import { ChevronDown, Package, Plane } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FEATURES } from "@/lib/features";

// Two entry points, matching the flow diagram: a sender looks for a
// traveller, a traveller looks for a sender.
export function ExploreMenu({
  label,
  travellerLabel,
  travellerHint,
  senderLabel,
  senderHint,
}: {
  label: string;
  travellerLabel: string;
  travellerHint: string;
  senderLabel: string;
  senderHint: string;
}) {
  const links = [
    { href: "/find-a-sender", label: travellerLabel, description: travellerHint, icon: Package },
    ...(FEATURES.bagSpaceMarketplace
      ? [{ href: "/find-a-traveller", label: senderLabel, description: senderHint, icon: Plane }]
      : []),
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary focus:outline-none">
        {label}
        <ChevronDown className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        {links.map((link) => (
          <DropdownMenuItem key={link.href} asChild className="py-2.5">
            <Link href={link.href} className="flex items-start gap-3">
              <link.icon className="mt-0.5 size-4 text-primary" />
              <span>
                <span className="block text-sm font-medium">{link.label}</span>
                <span className="block text-xs text-muted-foreground">{link.description}</span>
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
