"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationInput } from "@/components/common/location-input";
import { TRANSPORT_TYPES } from "@/lib/constants";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// The two sides of the marketplace, as destinations rather than a filter.
// A tab had to be chosen and then Search pressed before anything revealed
// where you were going; two named buttons say it up front.
const DESTINATIONS = {
  findTraveller: "/find-a-traveller",
  imTraveller: "/find-a-sender",
} as const;

export function HeroSearch({ t }: { t: Dictionary["search"] }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [transport, setTransport] = useState("");
  const [weight, setWeight] = useState("");
  const [showMore, setShowMore] = useState(false);
  const router = useRouter();

  // Whatever has been typed travels with you, so filling the fields is
  // never wasted whichever side you turn out to be on.
  function go(destination: keyof typeof DESTINATIONS) {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);
    if (transport) params.set("transport", transport);
    if (weight) params.set("weight", weight);
    router.push(`${DESTINATIONS[destination]}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-surface p-3 text-left shadow-lg">
      <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
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
      </div>

      {/* The choice is the action. Each button names where it goes, so the
          two sides of the marketplace are visible before anything is
          clicked rather than hidden behind a tab. */}
      <p className="mt-4 text-center text-xs text-muted-foreground">{t.ctaHint}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <Button onClick={() => go("findTraveller")} size="lg" className="w-full">
          <Search /> {t.ctaFindTraveller}
        </Button>
        <Button onClick={() => go("imTraveller")} size="lg" variant="outline" className="w-full">
          <Plane /> {t.ctaImTraveller}
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
