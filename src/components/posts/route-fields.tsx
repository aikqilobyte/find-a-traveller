"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { citiesForCountry, COUNTRIES_WITH_CITIES } from "@/lib/locations";
import { COUNTRIES } from "@/lib/constants";

/**
 * Route entry for the post forms.
 *
 * The city list narrows to whatever country is in the field beside it, so
 * picking Bangladesh offers Dhaka and Chittagong rather than every city we
 * know. Both fields stay ordinary text inputs backed by a datalist: the
 * suggestions help, but anywhere we don't have on file can still be typed,
 * which matters because the curated list is a starting set, not the world.
 */
export function RouteFields() {
  const [originCountry, setOriginCountry] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");

  const originCities = citiesForCountry(originCountry);
  const destinationCities = citiesForCountry(destinationCountry);

  return (
    <>
      <datalist id="country-list">
        {/* Countries we have cities for come first, since picking one of
            those makes the city field useful. */}
        {COUNTRIES_WITH_CITIES.map((c) => (
          <option key={c} value={c} />
        ))}
        {COUNTRIES.filter((c) => !COUNTRIES_WITH_CITIES.includes(c)).map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <datalist id="origin-city-list">
        {originCities.map((city) => (
          <option key={city} value={city} />
        ))}
      </datalist>

      <datalist id="destination-city-list">
        {destinationCities.map((city) => (
          <option key={city} value={city} />
        ))}
      </datalist>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="originCountry">Origin country</Label>
          <Input
            id="originCountry"
            name="originCountry"
            list="country-list"
            required
            placeholder="e.g. Bangladesh"
            value={originCountry}
            onChange={(e) => setOriginCountry(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="originCity">Origin city</Label>
          <Input
            id="originCity"
            name="originCity"
            list="origin-city-list"
            required
            placeholder={originCities.length > 0 ? `e.g. ${originCities[0]}` : "e.g. Dhaka"}
            autoComplete="off"
          />
          {originCountry && originCities.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No saved cities for that country — type the city name.
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="destinationCountry">Destination country</Label>
          <Input
            id="destinationCountry"
            name="destinationCountry"
            list="country-list"
            required
            placeholder="e.g. United Arab Emirates"
            value={destinationCountry}
            onChange={(e) => setDestinationCountry(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="destinationCity">Destination city</Label>
          <Input
            id="destinationCity"
            name="destinationCity"
            list="destination-city-list"
            required
            placeholder={destinationCities.length > 0 ? `e.g. ${destinationCities[0]}` : "e.g. Dubai"}
            autoComplete="off"
          />
          {destinationCountry && destinationCities.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No saved cities for that country — type the city name.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
