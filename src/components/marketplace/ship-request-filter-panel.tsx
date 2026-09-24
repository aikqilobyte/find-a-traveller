"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LocationInput } from "@/components/common/location-input";
import { CATEGORY_FALLBACK, TRANSPORT_TYPES } from "@/lib/constants";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ShipRequestFilterPanel({ t }: { t: Dictionary["marketplace"] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
  const [minBudget, setMinBudget] = useState(searchParams.get("minBudget") ?? "");
  const [maxBudget, setMaxBudget] = useState(searchParams.get("maxBudget") ?? "");
  const [maxWeight, setMaxWeight] = useState(searchParams.get("maxWeight") ?? "");
  const [transport, setTransport] = useState(searchParams.get("transport") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");

  function apply() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (minBudget) params.set("minBudget", minBudget);
    if (maxBudget) params.set("maxBudget", maxBudget);
    if (maxWeight) params.set("maxWeight", maxWeight);
    if (transport) params.set("transport", transport);
    if (category) params.set("category", category);
    router.push(`${pathname}?${params.toString()}`);
  }

  function reset() {
    setFrom("");
    setTo("");
    setMinBudget("");
    setMaxBudget("");
    setMaxWeight("");
    setTransport("");
    setCategory("");
    router.push(pathname);
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{t.filterBy}</h3>
        <button onClick={reset} className="text-sm text-primary hover:underline">
          {t.reset}
        </button>
      </div>

      <div className="space-y-2">
        <Label>{t.willingToPay}</Label>
        <div className="flex items-center gap-2">
          <Input type="number" min={0} placeholder={t.min} value={minBudget} onChange={(e) => setMinBudget(e.target.value)} />
          <Input type="number" min={0} placeholder={t.max} value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t.location}</Label>
        <LocationInput value={from} onChange={setFrom} placeholder={t.fromPlaceholder} />
        <LocationInput value={to} onChange={setTo} placeholder={t.toPlaceholder} />
      </div>

      <div className="space-y-2">
        <Label>{t.maxWeight}</Label>
        <Input type="number" min={0} value={maxWeight} onChange={(e) => setMaxWeight(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>{t.itemCategory}</Label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORY_FALLBACK.map((name) => {
            const slug = name.toLowerCase();
            return (
              <label key={slug} className="flex items-center gap-2 text-sm">
                <Checkbox checked={category === slug} onCheckedChange={(v) => setCategory(v ? slug : "")} />
                {name}
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t.transportType}</Label>
        <div className="space-y-2">
          {TRANSPORT_TYPES.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm">
              <Checkbox checked={transport === option.value} onCheckedChange={(v) => setTransport(v ? option.value : "")} />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <Button className="w-full" onClick={apply}>
        {t.applyFilters}
      </Button>
    </div>
  );
}
