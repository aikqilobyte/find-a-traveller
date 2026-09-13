"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TRANSPORT_TYPES } from "@/lib/constants";

export function TravelBuddyFilterPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
  const [travelDate, setTravelDate] = useState(searchParams.get("travelDate") ?? "");
  const [transport, setTransport] = useState(searchParams.get("transport") ?? "");

  function apply() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (travelDate) params.set("travelDate", travelDate);
    if (transport) params.set("transport", transport);
    router.push(`${pathname}?${params.toString()}`);
  }

  function reset() {
    setFrom("");
    setTo("");
    setTravelDate("");
    setTransport("");
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
        <Label>Location</Label>
        <Input placeholder="Origin country" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input placeholder="Destination country" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Travel date</Label>
        <Input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Transport</Label>
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
