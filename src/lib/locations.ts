// Curated location list for the From/To autosuggest. Kept local (rather
// than calling a places API) so suggestions are instant, work offline,
// and cost nothing — the corridors Find A Traveller actually serves are
// a small, known set. Airport codes are included because senders and
// travellers often think in terms of the airport (per the flow diagram).

export interface LocationOption {
  kind: "city" | "country";
  city?: string;
  country: string;
  /** IATA code, for city entries that have a major airport. */
  code?: string;
  /** What is shown in the dropdown and stored in the URL. */
  label: string;
}

type CityTuple = [city: string, code?: string];

const CITIES_BY_COUNTRY: Record<string, CityTuple[]> = {
  Bangladesh: [
    ["Dhaka", "DAC"],
    ["Chittagong", "CGP"],
    ["Sylhet", "ZYL"],
    ["Cox's Bazar", "CXB"],
    ["Rajshahi", "RJH"],
    ["Khulna"],
    ["Barisal", "BZL"],
    ["Rangpur"],
    ["Comilla"],
    ["Narayanganj"],
  ],
  "United Arab Emirates": [
    ["Dubai", "DXB"],
    ["Abu Dhabi", "AUH"],
    ["Sharjah", "SHJ"],
    ["Ajman"],
    ["Ras Al Khaimah", "RKT"],
    ["Al Ain", "AAN"],
  ],
  "Saudi Arabia": [
    ["Riyadh", "RUH"],
    ["Jeddah", "JED"],
    ["Dammam", "DMM"],
    ["Mecca"],
    ["Medina", "MED"],
  ],
  Qatar: [["Doha", "DOH"]],
  Kuwait: [["Kuwait City", "KWI"]],
  Oman: [["Muscat", "MCT"], ["Salalah", "SLL"]],
  Bahrain: [["Manama", "BAH"]],
  India: [
    ["Delhi", "DEL"],
    ["Mumbai", "BOM"],
    ["Kolkata", "CCU"],
    ["Chennai", "MAA"],
    ["Bangalore", "BLR"],
    ["Hyderabad", "HYD"],
    ["Kochi", "COK"],
    ["Ahmedabad", "AMD"],
  ],
  Pakistan: [
    ["Karachi", "KHI"],
    ["Lahore", "LHE"],
    ["Islamabad", "ISB"],
    ["Peshawar", "PEW"],
  ],
  "United Kingdom": [
    ["London", "LHR"],
    ["Manchester", "MAN"],
    ["Birmingham", "BHX"],
    ["Glasgow", "GLA"],
    ["Edinburgh", "EDI"],
    ["Leeds", "LBA"],
    ["Luton", "LTN"],
  ],
  "United States": [
    ["New York", "JFK"],
    ["Los Angeles", "LAX"],
    ["Chicago", "ORD"],
    ["Houston", "IAH"],
    ["Washington", "IAD"],
    ["Atlanta", "ATL"],
    ["Boston", "BOS"],
    ["San Francisco", "SFO"],
    ["Dallas", "DFW"],
    ["Miami", "MIA"],
    ["Detroit", "DTW"],
  ],
  Canada: [
    ["Toronto", "YYZ"],
    ["Montreal", "YUL"],
    ["Vancouver", "YVR"],
    ["Calgary", "YYC"],
    ["Ottawa", "YOW"],
    ["Edmonton", "YEG"],
  ],
  Malaysia: [["Kuala Lumpur", "KUL"], ["Penang", "PEN"], ["Johor Bahru", "JHB"]],
  Singapore: [["Singapore", "SIN"]],
  Thailand: [["Bangkok", "BKK"], ["Phuket", "HKT"], ["Chiang Mai", "CNX"]],
  Australia: [
    ["Sydney", "SYD"],
    ["Melbourne", "MEL"],
    ["Brisbane", "BNE"],
    ["Perth", "PER"],
    ["Adelaide", "ADL"],
  ],
  Turkey: [["Istanbul", "IST"], ["Ankara", "ESB"], ["Antalya", "AYT"]],
  Germany: [["Frankfurt", "FRA"], ["Berlin", "BER"], ["Munich", "MUC"], ["Hamburg", "HAM"]],
  France: [["Paris", "CDG"], ["Marseille", "MRS"], ["Lyon", "LYS"], ["Nice", "NCE"]],
  Italy: [["Rome", "FCO"], ["Milan", "MXP"], ["Venice", "VCE"], ["Naples", "NAP"]],
  Spain: [["Madrid", "MAD"], ["Barcelona", "BCN"], ["Valencia", "VLC"]],
  Netherlands: [["Amsterdam", "AMS"], ["Rotterdam", "RTM"]],
  Sweden: [["Stockholm", "ARN"], ["Gothenburg", "GOT"]],
  Ireland: [["Dublin", "DUB"]],
  Switzerland: [["Zurich", "ZRH"], ["Geneva", "GVA"]],
  Belgium: [["Brussels", "BRU"]],
  Portugal: [["Lisbon", "LIS"], ["Porto", "OPO"]],
  Japan: [["Tokyo", "NRT"], ["Osaka", "KIX"]],
  "South Korea": [["Seoul", "ICN"], ["Busan", "PUS"]],
  China: [["Beijing", "PEK"], ["Shanghai", "PVG"], ["Guangzhou", "CAN"], ["Hong Kong", "HKG"]],
  Indonesia: [["Jakarta", "CGK"], ["Bali", "DPS"]],
  Philippines: [["Manila", "MNL"], ["Cebu", "CEB"]],
  Vietnam: [["Ho Chi Minh City", "SGN"], ["Hanoi", "HAN"]],
  Nepal: [["Kathmandu", "KTM"]],
  "Sri Lanka": [["Colombo", "CMB"]],
  Maldives: [["Malé", "MLE"]],
  Egypt: [["Cairo", "CAI"]],
  "South Africa": [["Johannesburg", "JNB"], ["Cape Town", "CPT"]],
  Kenya: [["Nairobi", "NBO"]],
  Nigeria: [["Lagos", "LOS"], ["Abuja", "ABV"]],
  Brazil: [["São Paulo", "GRU"], ["Rio de Janeiro", "GIG"]],
  Russia: [["Moscow", "SVO"]],
  "New Zealand": [["Auckland", "AKL"]],
};

function buildOptions(): LocationOption[] {
  const options: LocationOption[] = [];

  for (const [country, cities] of Object.entries(CITIES_BY_COUNTRY)) {
    options.push({ kind: "country", country, label: country });
    for (const [city, code] of cities) {
      options.push({
        kind: "city",
        city,
        country,
        code,
        label: `${city}, ${country}`,
      });
    }
  }

  return options;
}

export const LOCATIONS: LocationOption[] = buildOptions();

/**
 * Booking.com-style prefix matching: typing one or two letters should
 * already surface sensible suggestions. Ranks whole-word prefix matches
 * above mid-word matches so "du" puts Dubai before Ras Al Khaimah.
 */
export function searchLocations(query: string, limit = 8): LocationOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored: { option: LocationOption; score: number }[] = [];

  for (const option of LOCATIONS) {
    const name = (option.city ?? option.country).toLowerCase();
    const country = option.country.toLowerCase();
    const code = option.code?.toLowerCase();

    let score = -1;
    if (code && code === q) score = 0;
    else if (name.startsWith(q)) score = 1;
    else if (country.startsWith(q) && option.kind === "country") score = 2;
    else if (name.split(/[\s-]/).some((w) => w.startsWith(q))) score = 3;
    else if (country.startsWith(q)) score = 4;
    else if (name.includes(q)) score = 5;
    else if (country.includes(q)) score = 6;

    if (score >= 0) {
      // Countries float slightly above their own cities at equal score.
      scored.push({ option, score: score * 10 + (option.kind === "country" ? 0 : 1) });
    }
  }

  return scored
    .sort((a, b) => a.score - b.score || a.option.label.length - b.option.label.length)
    .slice(0, limit)
    .map((s) => s.option);
}
