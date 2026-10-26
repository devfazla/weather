import type {
  DayPoint,
  HourPoint,
  Metric,
  Place,
  Weather,
  WeatherKind,
} from "../data/weather";
import { cachedJson } from "./cache";
import { clockLabel, hourLabel, uvRating, weekdayLabel } from "./format";
import { resolveHero } from "./heroImage";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

/** Model grids are 1–11 km wide, so the cache key stops at ~1 km. */
const round = (value: number) => Number(value.toFixed(2));

const FORECAST_TTL = 10 * 60_000;
const AIR_TTL = 30 * 60_000;
const GEOCODE_TTL = 24 * 60 * 60_000;

/** The slice of /v1/forecast this dashboard actually reads. */
type ForecastResponse = {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    uv_index: number[];
    is_day: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    wind_speed_10m_max: number[];
  };
};

type AirQualityResponse = { current?: { us_aqi?: number } };

type GeocodingResponse = {
  results?: {
    name: string;
    latitude: number;
    longitude: number;
    admin1?: string;
    country?: string;
  }[];
};

/** WMO 4677 codes, collapsed onto the four glyphs the UI already draws. */
const WMO: Record<number, { kind: WeatherKind; short: string; condition: string }> = {
  0: { kind: "sun", short: "Sunny", condition: "Clear & bright" },
  1: { kind: "sun", short: "Mostly sunny", condition: "Mostly clear" },
  2: { kind: "partly", short: "Partly cloudy", condition: "Partly cloudy" },
  3: { kind: "cloud", short: "Overcast", condition: "Soft overcast" },
  45: { kind: "cloud", short: "Foggy", condition: "Low fog" },
  48: { kind: "cloud", short: "Foggy", condition: "Frozen fog" },
  51: { kind: "cloud", short: "Drizzle", condition: "Light drizzle" },
  53: { kind: "cloud", short: "Drizzle", condition: "Drizzle" },
  55: { kind: "cloud", short: "Drizzle", condition: "Heavy drizzle" },
  56: { kind: "cloud", short: "Icy drizzle", condition: "Freezing drizzle" },
  57: { kind: "cloud", short: "Icy drizzle", condition: "Freezing drizzle" },
  61: { kind: "cloud", short: "Light rain", condition: "Light rain" },
  63: { kind: "cloud", short: "Rain", condition: "Steady rain" },
  65: { kind: "cloud", short: "Heavy rain", condition: "Heavy rain" },
  66: { kind: "cloud", short: "Icy rain", condition: "Freezing rain" },
  67: { kind: "cloud", short: "Icy rain", condition: "Freezing rain" },
  71: { kind: "cloud", short: "Light snow", condition: "Light snow" },
  73: { kind: "cloud", short: "Snow", condition: "Steady snow" },
  75: { kind: "cloud", short: "Heavy snow", condition: "Heavy snow" },
  77: { kind: "cloud", short: "Snow grains", condition: "Snow grains" },
  80: { kind: "cloud", short: "Showers", condition: "Passing showers" },
  81: { kind: "cloud", short: "Showers", condition: "Rain showers" },
  82: { kind: "cloud", short: "Downpours", condition: "Heavy showers" },
  85: { kind: "cloud", short: "Snow showers", condition: "Snow showers" },
  86: { kind: "cloud", short: "Snow showers", condition: "Heavy snow showers" },
  95: { kind: "cloud", short: "Thunderstorms", condition: "Thunderstorms" },
  96: { kind: "cloud", short: "Thunderstorms", condition: "Storm & hail" },
  99: { kind: "cloud", short: "Thunderstorms", condition: "Storm & hail" },
};

const UNKNOWN_CODE = { kind: "cloud" as WeatherKind, short: "Cloudy", condition: "Mixed skies" };

function codeMeta(code: number) {
  return WMO[code] ?? UNKNOWN_CODE;
}

/** WMO code -> WeatherKind, so the strip and week list keep their icons. */
export function wmoToKind(code: number, isDay = 1): WeatherKind {
  const meta = codeMeta(code);
  // A clear night reads better as the low sun than a bright one.
  if (!isDay && meta.kind === "sun") return "low";
  return meta.kind;
}

/** US AQI bucket, matching the "Good 28" copy in the design. */
export function aqiLabel(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for some";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very unhealthy";
  return "Hazardous";
}

const isSnow = (code: number) => (code >= 71 && code <= 77) || code === 85 || code === 86;
const isWet = (code: number) => (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;

function forecastUrl({ lat, lon }: Place): string {
  const params = new URLSearchParams({
    latitude: String(round(lat)),
    longitude: String(round(lon)),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    hourly: "temperature_2m,weather_code,uv_index,is_day",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,wind_speed_10m_max",
    timezone: "auto",
    forecast_days: "7",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
  });
  return `${FORECAST_URL}?${params.toString()}`;
}

function airQualityUrl({ lat, lon }: Place): string {
  const params = new URLSearchParams({
    latitude: String(round(lat)),
    longitude: String(round(lon)),
    current: "us_aqi",
    timezone: "auto",
  });
  return `${AIR_QUALITY_URL}?${params.toString()}`;
}

/**
 * Forecast + air quality in one round trip. Air quality is best-effort: the
 * metric card and the spotlight stat simply drop the number if it fails.
 */
export async function fetchWeather(place: Place, signal?: AbortSignal): Promise<Weather> {
  const [forecast, air] = await Promise.all([
    cachedJson<ForecastResponse>(forecastUrl(place), FORECAST_TTL, signal),
    cachedJson<AirQualityResponse>(airQualityUrl(place), AIR_TTL, signal).catch(() => null),
  ]);

  return buildWeather(place, forecast, air?.current?.us_aqi ?? null);
}

/** Geocoding API lookup used by the header search box. */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const params = new URLSearchParams({
    name: query,
    count: "5",
    language: "en",
    format: "json",
  });

  const data = await cachedJson<GeocodingResponse>(
    `${GEOCODING_URL}?${params.toString()}`,
    GEOCODE_TTL,
    signal,
  );

  return (data.results ?? []).map((result) => ({
    name: result.name,
    region: [result.admin1, result.country].filter(Boolean).join(", "),
    lat: result.latitude,
    lon: result.longitude,
  }));
}

function buildWeather(place: Place, forecast: ForecastResponse, aqi: number | null): Weather {
  const { current, hourly, daily } = forecast;
  const lastIndex = hourly.time.length - 1;
  const at = (index: number) => Math.min(index, lastIndex);

  // Timestamps are wall-clock for the location, so string matching finds "now".
  const nowKey = current.time.slice(0, 13);
  const startIndex = Math.max(
    hourly.time.findIndex((time) => time.slice(0, 13) === nowKey),
    0,
  );

  const hourlyPoints: HourPoint[] = Array.from({ length: 8 }, (_, offset) => {
    const index = at(startIndex + offset);
    return {
      label: offset === 0 ? "Now" : hourLabel(hourly.time[index]),
      temp: Math.round(hourly.temperature_2m[index]),
      kind: wmoToKind(hourly.weather_code[index], hourly.is_day[index] ?? 1),
    };
  });

  // The marker on each bar is that day's high placed inside the week's spread.
  const weekMin = Math.min(...daily.temperature_2m_min);
  const weekMax = Math.max(...daily.temperature_2m_max);
  const span = Math.max(weekMax - weekMin, 1);

  const week: DayPoint[] = daily.time.map((date, index) => {
    const high = Math.round(daily.temperature_2m_max[index]);
    const pct = Math.round(6 + ((high - weekMin) / span) * 88);

    return {
      label: index === 0 ? "Today" : weekdayLabel(date),
      low: Math.round(daily.temperature_2m_min[index]),
      high,
      kind: wmoToKind(daily.weather_code[index]),
      pct: Math.min(94, Math.max(6, pct)),
    };
  });

  const code = current.weather_code;
  const meta = codeMeta(code);
  const hour = Number(current.time.slice(11, 13));
  const dayPart = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  const uvNow = hourly.uv_index[at(startIndex)] ?? daily.uv_index_max[0] ?? 0;
  const uvName = uvRating(uvNow).toLowerCase();
  const airLabel = aqi === null ? null : `${aqiLabel(aqi)} ${aqi}`;
  const airNote = aqi === null ? "air n/a" : `AQI ${aqi}`;

  const nextCodes = Array.from({ length: 6 }, (_, offset) =>
    at(startIndex + offset),
  ).map((index) => hourly.weather_code[index]);
  const wetOffset = nextCodes.findIndex(isWet);

  const headline =
    wetOffset >= 0
      ? `Showers by ${hourLabel(hourly.time[at(startIndex + wetOffset)])}.`
      : nextCodes.every((next) => next <= 2)
        ? `Blue skies all ${dayPart}.`
        : `Soft clouds this ${dayPart}.`;

  const photo = isSnow(code)
    ? { title: "Bundle up out there", note: `Snow · UV ${uvName}` }
    : isWet(code)
      ? { title: "Umbrella weather", note: `Rain · UV ${uvName}` }
      : Math.round(daily.temperature_2m_max[0]) >= 28
        ? { title: "Shade is your friend", note: `UV ${uvName} · ${airNote}` }
        : { title: "Perfect outside", note: `UV ${uvName} · ${airNote}` };

  const metrics: Metric[] = [
    { key: "wind", value: `${Math.round(current.wind_speed_10m)} km/h`, label: "Wind" },
    {
      key: "humidity",
      value: `${Math.round(current.relative_humidity_2m)}%`,
      label: "Humidity",
    },
    { key: "uv", value: `${Math.round(uvNow)} ${uvRating(uvNow)}`, label: "UV index" },
  ];

  return {
    city: place.name,
    status: `Now · ${meta.short}`,
    badge: `${meta.short} ${dayPart}`,
    temp: Math.round(current.temperature_2m),
    condition: meta.condition,
    high: Math.round(daily.temperature_2m_max[0]),
    low: Math.round(daily.temperature_2m_min[0]),
    feels: Math.round(current.apparent_temperature),
    sunrise: clockLabel(daily.sunrise[0]),
    sunset: clockLabel(daily.sunset[0]),
    photo,
    hero: resolveHero({
      code,
      isDay: hourly.is_day[at(startIndex)] !== 0,
      tempC: current.temperature_2m,
    }),
    hourly: hourlyPoints,
    week,
    spotlight: {
      // One line. The sunset time and the air index are the rows underneath,
      // so the headline doesn't restate them.
      headline,
      stats: [
        { icon: "air", label: "Air quality", value: airLabel ?? "Unavailable" },
        { icon: "sunset", label: "Sunset", value: clockLabel(daily.sunset[0]) },
      ],
    },
    metrics,
    updated: `Updated ${clockLabel(current.time)}`,
    source: "live",
  };
}
