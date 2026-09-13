"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TRANSPORT_TYPES, TRIP_TYPES, CATEGORY_FALLBACK } from "@/lib/constants";

export function TravellerFilterPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
  const [departureDate, setDepartureDate] = useState(searchParams.get("departureDate") ?? "");
  const [weight, setWeight] = useState(searchParams.get("weight") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [tripType, setTripType] = useState(searchParams.get("tripType") ?? "");
  const [transport, setTransport] = useState<string[]>(searchParams.get("transport")?.split(",").filter(Boolean) ?? []);
  const [category, setCategory] = useState(searchParams.get("category") ?? "");

  function apply() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (departureDate) params.set("departureDate", departureDate);
    if (weight) params.set("weight", weight);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (tripType) params.set("tripType", tripType);
    if (transport.length) params.set("transport", transport.join(","));
    if (category) params.set("category", category);
    router.push(`${pathname}?${params.toString()}`);
  }

  function reset() {
    setFrom("");
    setTo("");
    setDepartureDate("");
    setWeight("");
    setMinPrice("");
    setMaxPrice("");
    setTripType("");
    setTransport([]);
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
        <Label>Charge ($/kg)</Label>
        <div className="flex items-center gap-2">
          <Input type="number" min={0} placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          <Input type="number" min={0} placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <Input placeholder="Origin country" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input placeholder="Destination country" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Departure date</Label>
        <Input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Minimum available space (kg)</Label>
        <Input type="number" min={0} value={weight} onChange={(e) => setWeight(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Product category</Label>
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
        <Label>Trip type</Label>
        <RadioGroup value={tripType} onValueChange={setTripType}>
          {TRIP_TYPES.map((t) => (
            <label key={t.value} className="flex items-center gap-2 text-sm">
              <RadioGroupItem value={t.value} />
              {t.label}
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Transport type</Label>
        <div className="space-y-2">
          {TRANSPORT_TYPES.map((t) => (
            <label key={t.value} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={transport.includes(t.value)}
                onCheckedChange={(checked) =>
                  setTransport((prev) => (checked ? [...prev, t.value] : prev.filter((v) => v !== t.value)))
                }
              />
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
