import Link from "next/link";
import { FEATURES } from "@/lib/features";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/find-a-sender", label: "Explore as Traveller" },
  { href: "/find-a-traveller", label: "Explore as Receiver" },
];

export function MarketplaceTabs({ active }: { active: string }) {
  // With the bag-space marketplace hidden there is only one browse view,
  // so the toggle would be a single dead tab.
  if (!FEATURES.bagSpaceMarketplace) return null;

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
