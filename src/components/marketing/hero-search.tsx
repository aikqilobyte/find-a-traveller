"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "available-space", label: "Available Space", href: "/available-space" },
  { value: "ship-requests", label: "Ship Requests", href: "/ship-requests" },
  { value: "travel-buddy", label: "Travel Buddy", href: "/travel-buddy" },
] as const;

export function HeroSearch() {
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("available-space");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const router = useRouter();

  function handleSearch() {
    const target = TABS.find((t) => t.value === tab)!;
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`${target.href}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-surface p-3 shadow-lg">
      <div className="flex flex-wrap gap-1 rounded-lg bg-surface-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.value ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="text-left">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">From</label>
          <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="e.g. Bangladesh" />
        </div>
        <div className="text-left">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">To</label>
          <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="e.g. Dubai" />
        </div>
        <Button onClick={handleSearch} size="lg" className="w-full sm:w-auto">
          <Search /> Search
        </Button>
      </div>
    </div>
  );
}
