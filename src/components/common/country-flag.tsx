import { Globe } from "lucide-react";
import { countryCode } from "@/lib/locations";

/**
 * A country's flag, falling back to a globe for anything unrecognised.
 *
 * Flag emoji would be simpler, but Windows ships no flag glyphs: Chrome and
 * Edge there render them as the bare letter pair ("GB"), which looks like a
 * bug on the largest desktop platform. Images render the same everywhere.
 */
export function CountryFlag({ country, className }: { country: string | null | undefined; className?: string }) {
  const code = countryCode(country);

  if (!code) return <Globe className={className ?? "size-3"} aria-hidden="true" />;

  return (
    /* A 20px flag needs no optimisation pipeline, and next/image would mean
       a remote-pattern config for a decorative icon. */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w20/${code}.png`}
      srcSet={`https://flagcdn.com/w40/${code}.png 2x`}
      width={16}
      height={12}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      className={className ?? "h-3 w-4 shrink-0 rounded-[2px] object-cover"}
    />
  );
}
