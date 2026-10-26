import type { Place } from "../data/weather";

const PLACE_KEY = "weather.place.v1";
const IP_KEY = "weather.ip-place.v1";
const IP_TTL = 24 * 60 * 60_000;

function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage disabled or full. The dashboard still works, it just forgets.
  }
}

function isPlace(value: unknown): value is Place {
  if (!value || typeof value !== "object") return false;
  const place = value as Record<string, unknown>;

  return (
    typeof place.name === "string" &&
    place.name.length > 0 &&
    typeof place.region === "string" &&
    typeof place.lat === "number" &&
    Number.isFinite(place.lat) &&
    typeof place.lon === "number" &&
    Number.isFinite(place.lon)
  );
}

/** The place the user picked, or null on a first visit. */
export function readSavedPlace(): Place | null {
  const value = readJson(PLACE_KEY);
  return isPlace(value) ? value : null;
}

export function savePlace(place: Place): void {
  writeJson(PLACE_KEY, place);
}

function toPlace(
  name: string,
  regionParts: string[],
  lat: number,
  lon: number,
): Place | null {
  if (!name || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { name, region: regionParts.filter(Boolean).join(", "), lat, lon };
}

function text(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

function number(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  return typeof value === "number" ? value : Number(value);
}

type IpProvider = {
  url: string;
  parse: (data: Record<string, unknown>) => Place | null;
  /** ISO country code, for the submission metadata. */
  code: (data: Record<string, unknown>) => string;
};

const IP_PROVIDERS: IpProvider[] = [
  {
    url: "https://ipwho.is/",
    code: (data) => text(data, "country_code"),
    parse: (data) =>
      data.success === false
        ? null
        : toPlace(text(data, "city"), [text(data, "region"), text(data, "country")], number(data, "latitude"), number(data, "longitude")),
  },
  {
    url: "https://get.geojs.io/v1/ip/geo.json",
    code: (data) => text(data, "country_code"),
    parse: (data) =>
      toPlace(text(data, "city"), [text(data, "region"), text(data, "country")], number(data, "latitude"), number(data, "longitude")),
  },
];

/**
 * Rough city-level placement from the visitor's IP, cached for a day so a
 * reload doesn't spend another lookup. Always resolves: null means "we tried".
 */
export async function detectPlaceByIp(): Promise<Place | null> {
  const cached = readJson(IP_KEY);

  if (cached && typeof cached === "object") {
    const entry = cached as { savedAt?: unknown; place?: unknown };
    if (
      typeof entry.savedAt === "number" &&
      Date.now() - entry.savedAt < IP_TTL &&
      isPlace(entry.place)
    ) {
      return entry.place;
    }
  }

  for (const provider of IP_PROVIDERS) {
    try {
      const response = await fetch(provider.url, { headers: { Accept: "application/json" } });
      if (!response.ok) continue;

      const data = (await response.json()) as Record<string, unknown>;
      const place = provider.parse(data);
      if (place) {
        writeJson(IP_KEY, { savedAt: Date.now(), place, code: provider.code(data) });
        return place;
      }
    } catch {
      // Try the next provider. IP lookups are best-effort.
    }
  }

  return null;
}

/** Coarse location the server would otherwise read off platform headers. */
export type GeoHint = { city: string; region: string; country: string };

/**
 * The visitor's own rough location, as the IP lookup left it. Deliberately not
 * the city on screen, since that one may be somewhere they searched for. Never hits
 * the network, and a day-old entry is still a better guess than "unknown".
 */
export function readGeoHint(): GeoHint | null {
  const cached = readJson(IP_KEY);
  if (!cached || typeof cached !== "object") return null;

  const entry = cached as { place?: unknown; code?: unknown };
  if (!isPlace(entry.place)) return null;

  return {
    city: entry.place.name,
    region: entry.place.region,
    country: typeof entry.code === "string" ? entry.code : "",
  };
}

/** Coordinates -> nearest city name, for the "My location" flow. */
export async function reverseGeocode(lat: number, lon: number): Promise<Place | null> {
  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      localityLanguage: "en",
    });

    // The old api.bigdatacloud.net host answers with a 307 to this one, and the
    // browser has to be allowed to reach wherever a redirect lands. Asking the
    // final host directly keeps one origin in the policy instead of two.
    const response = await fetch(
      `https://api-bdc.io/data/reverse-geocode-client?${params.toString()}`,
    );
    if (!response.ok) return null;

    const data = (await response.json()) as Record<string, unknown>;
    const name =
      text(data, "city") || text(data, "locality") || text(data, "principalSubdivision");
    const region = [text(data, "principalSubdivision"), text(data, "countryName")].filter(
      (part) => part && part !== name,
    );

    return name ? { name, region: region.join(", "), lat, lon } : null;
  } catch {
    return null;
  }
}
