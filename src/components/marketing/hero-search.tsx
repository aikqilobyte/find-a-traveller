"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationInput } from "@/components/common/location-input";
import { TRANSPORT_TYPES } from "@/lib/constants";
import { FEATURES } from "@/lib/features";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type TabValue = "send" | "travel";

// With the bag-space marketplace hidden there is one browse view, so both
// intents land on the package marketplace: a receiver searches it to see
// the route is covered, a traveller searches it for something to carry.
const TAB_HREFS: Record<TabValue, string> = {
  send: FEATURES.bagSpaceMarketplace ? "/find-a-traveller" : "/find-a-sender",
  travel: "/find-a-sender",
};

export function HeroSearch({ t }: { t: Dictionary["search"] }) {
  const [tab, setTab] = useState<TabValue>("send");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [transport, setTransport] = useState("");
  const [weight, setWeight] = useState("");
  const [showMore, setShowMore] = useState(false);
  const router = useRouter();

  const tabs: { value: TabValue; label: string }[] = [
    { value: "send", label: t.sendingTab },
    { value: "travel", label: t.travellingTab },
  ];

  function handleSearch() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);
    if (transport) params.set("transport", transport);
    if (weight) params.set("weight", weight);
    router.push(`${TAB_HREFS[tab]}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-surface p-3 text-left shadow-lg">
      <div className="flex flex-wrap gap-1 rounded-lg bg-surface-muted p-1">
        {tabs.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setTab(option.value)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === option.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <Label htmlFor="hero-from" className="mb-1 block text-xs text-muted-foreground">
            {t.from}
          </Label>
          <LocationInput id="hero-from" value={from} onChange={setFrom} placeholder={t.locationPlaceholder} />
        </div>
        <div>
          <Label htmlFor="hero-to" className="mb-1 block text-xs text-muted-foreground">
            {t.to}
          </Label>
          <LocationInput id="hero-to" value={to} onChange={setTo} placeholder={t.locationPlaceholder} />
        </div>
        <Button onClick={handleSearch} size="lg" className="w-full sm:w-auto">
          <Search /> {t.search}
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
      >
        <SlidersHorizontal className="size-3.5" />
        {showMore ? t.hideFilters : t.moreFilters}
      </button>

      {showMore && (
        <div className="mt-3 grid gap-3 border-t border-border pt-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="hero-from-date" className="mb-1 block text-xs text-muted-foreground">
              {t.fromDate}
            </Label>
            <Input id="hero-from-date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="hero-to-date" className="mb-1 block text-xs text-muted-foreground">
              {t.toDate}
            </Label>
            <Input id="hero-to-date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="hero-transport" className="mb-1 block text-xs text-muted-foreground">
              {t.transport}
            </Label>
            <Select value={transport} onValueChange={setTransport}>
              <SelectTrigger id="hero-transport" className="w-full">
                <SelectValue placeholder={t.any} />
              </SelectTrigger>
              <SelectContent>
                {TRANSPORT_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="hero-weight" className="mb-1 block text-xs text-muted-foreground">
              {t.weight}
            </Label>
            <Input
              id="hero-weight"
              type="number"
              min={0}
              step="0.5"
              placeholder="5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
