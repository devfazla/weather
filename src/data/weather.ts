import { fallbackHero, type HeroScene } from "../lib/heroImage";

export type WeatherKind = "sun" | "partly" | "cloud" | "low";

export type HourPoint = {
  label: string;
  temp: number;
  kind: WeatherKind;
};

export type DayPoint = {
  label: string;
  low: number;
  high: number;
  kind: WeatherKind;
  /** where the "now" marker sits along the range bar, 0–100 */
  pct: number;
};

export type Metric = {
  key: "wind" | "humidity" | "uv";
  value: string;
  label: string;
};

export type Place = {
  name: string;
  /** "California, United States" — shown next to the name in the search list */
  region: string;
  lat: number;
  lon: number;
};

export type Weather = {
  city: string;
  status: string;
  badge: string;
  temp: number;
  condition: string;
  high: number;
  low: number;
  feels: number;
  sunrise: string;
  sunset: string;
  photo: { title: string; note: string };
  /** Photo matching the conditions outside right now. */
  hero: HeroScene;
  hourly: HourPoint[];
  week: DayPoint[];
  spotlight: { headline: string[]; meta: string; action: string };
  tip: string;
  metrics: Metric[];
  updated: string;
  source: "live" | "sample";
};

export const defaultPlace: Place = {
  name: "San Francisco",
  region: "California, United States",
  lat: 37.7749,
  lon: -122.4194,
};

/**
 * Paints the dashboard before the first Open-Meteo response lands, and stays on
 * screen if every request fails — the layout never collapses to a skeleton.
 */
export const fallbackWeather: Weather = {
  city: defaultPlace.name,
  status: "Now · Sunny",
  badge: "Sunny morning",
  temp: 21,
  condition: "Clear & bright",
  high: 24,
  low: 14,
  feels: 22,
  sunrise: "6:48 AM",
  sunset: "7:52 PM",
  photo: {
    title: "Perfect outside",
    note: "UV low till noon",
  },
  hero: fallbackHero,
  hourly: [
    { label: "Now", temp: 21, kind: "sun" },
    { label: "11AM", temp: 22, kind: "sun" },
    { label: "12PM", temp: 23, kind: "sun" },
    { label: "1PM", temp: 24, kind: "partly" },
    { label: "2PM", temp: 24, kind: "partly" },
    { label: "3PM", temp: 23, kind: "cloud" },
    { label: "4PM", temp: 22, kind: "cloud" },
    { label: "5PM", temp: 20, kind: "low" },
  ],
  week: [
    { label: "Today", low: 14, high: 24, kind: "sun", pct: 93 },
    { label: "Tue", low: 15, high: 25, kind: "sun", pct: 90 },
    { label: "Wed", low: 15, high: 23, kind: "partly", pct: 70 },
    { label: "Thu", low: 13, high: 20, kind: "cloud", pct: 59 },
    { label: "Fri", low: 14, high: 22, kind: "partly", pct: 68 },
    { label: "Sat", low: 16, high: 26, kind: "sun", pct: 90 },
    { label: "Sun", low: 17, high: 27, kind: "sun", pct: 95 },
  ],
  spotlight: {
    headline: ["Blue skies all morning.", "Golden hour at 7."],
    meta: "Air quality · Good 28",
    action: "Best time",
  },
  tip: "Ocean breeze after 3 PM — perfect for a walk.",
  metrics: [
    { key: "wind", value: "9 km/h", label: "Wind" },
    { key: "humidity", value: "42%", label: "Humidity" },
    { key: "uv", value: "3 Low", label: "UV index" },
  ],
  updated: "Updated 10:02 AM",
  source: "sample",
};
