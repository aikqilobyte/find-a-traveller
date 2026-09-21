// The From/To inputs accept either "Country" or "City, Country" (and the
// autosuggest writes the latter). A search for either should match a post
// whose city OR country lines up, so results stay forgiving rather than
// silently empty.

/** Strip characters that would break PostgREST's `or=` filter grammar. */
function sanitize(value: string): string {
  return value.replace(/["(),]/g, " ").replace(/\s+/g, " ").trim();
}

export function buildLocationOrFilter(
  rawValue: string,
  cityColumn: string,
  countryColumn: string,
): string | null {
  const parts = rawValue
    .split(",")
    .map((part) => sanitize(part))
    .filter(Boolean);

  if (parts.length === 0) return null;

  const city = parts[0];
  const country = parts[parts.length - 1];

  const clauses = [`${cityColumn}.ilike."%${city}%"`, `${countryColumn}.ilike."%${country}%"`];
  if (country !== city) clauses.push(`${countryColumn}.ilike."%${city}%"`);

  return clauses.join(",");
}
