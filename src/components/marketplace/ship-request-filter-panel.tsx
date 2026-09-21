"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LocationInput } from "@/components/common/location-input";
import { CATEGORY_FALLBACK, TRANSPORT_TYPES } from "@/lib/constants";

export function ShipRequestFilterPanel() {
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
        <h3 className="font-semibold text-foreground">Filter By</h3>
        <button onClick={reset} className="text-sm text-primary hover:underline">
          Reset
        </button>
      </div>

      <div className="space-y-2">
        <Label>Willing to pay</Label>
        <div className="flex items-center gap-2">
          <Input type="number" min={0} placeholder="Min" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} />
          <Input type="number" min={0} placeholder="Max" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <LocationInput value={from} onChange={setFrom} placeholder="From: country, city or airport" />
        <LocationInput value={to} onChange={setTo} placeholder="To: country, city or airport" />
      </div>

      <div className="space-y-2">
        <Label>Max item weight (kg)</Label>
        <Input type="number" min={0} value={maxWeight} onChange={(e) => setMaxWeight(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Item category</Label>
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
        <Label>Transport preference</Label>
        <div className="space-y-2">
          {TRANSPORT_TYPES.map((t) => (
            <label key={t.value} className="flex items-center gap-2 text-sm">
              <Checkbox checked={transport === t.value} onCheckedChange={(v) => setTransport(v ? t.value : "")} />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <Button className="w-full" onClick={apply}>
        Apply Filters
      </Button>
    </div>
  );
}
