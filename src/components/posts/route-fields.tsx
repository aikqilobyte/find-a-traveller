import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COUNTRIES } from "@/lib/constants";

export function RouteFields() {
  return (
    <>
      <datalist id="country-list">
        {COUNTRIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="originCountry">Origin country</Label>
          <Input id="originCountry" name="originCountry" list="country-list" required placeholder="e.g. Bangladesh" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="originCity">Origin city</Label>
          <Input id="originCity" name="originCity" required placeholder="e.g. Dhaka" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="destinationCountry">Destination country</Label>
          <Input id="destinationCountry" name="destinationCountry" list="country-list" required placeholder="e.g. United Arab Emirates" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="destinationCity">Destination city</Label>
          <Input id="destinationCity" name="destinationCity" required placeholder="e.g. Dubai" />
        </div>
      </div>
    </>
  );
}
