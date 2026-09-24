import Link from "next/link";
import { cn } from "@/lib/utils";

// Both sides are core shipping: a traveller browses packages to carry, a
// receiver browses travellers who can carry theirs.
const TABS = [
  { href: "/find-a-sender", label: "Explore as Traveller" },
  { href: "/find-a-traveller", label: "Explore as Receiver" },
];

export function MarketplaceTabs({ active }: { active: string }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg bg-surface-muted p-1">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
            active === tab.href ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
