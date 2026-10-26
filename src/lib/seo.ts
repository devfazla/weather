import { useEffect } from "react";
import type { Weather } from "../data/weather";

/** Per-route head content. Pass a module-level constant, not an inline object. */
type PageMeta = {
  title: string;
  description: string;
  canonical: string;
  /** Extra structured data for the route, dropped again when it unmounts. */
  schema?: object;
};

function setMeta(name: string, content: string): void {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.append(tag);
  }

  tag.content = content;
}

/**
 * Head tags for the route the router just swapped in. The markup in index.html
 * is the crawlable default for the dashboard; this keeps the title, description
 * and canonical honest for every other route.
 */
export function usePageMeta({ title, description, canonical, schema }: PageMeta): void {
  useEffect(() => {
    document.title = title;
    setMeta("description", description);
    document.head.querySelector('link[rel="canonical"]')?.setAttribute("href", canonical);

    if (!schema) return;

    const tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.textContent = JSON.stringify(schema);
    document.head.append(tag);

    return () => tag.remove();
  }, [title, description, canonical, schema]);
}

/**
 * Keeps the tab title and the meta description in step with the city on
 * screen. The tags in index.html stay the crawlable default (they describe the
 * page before the first forecast lands) and only get refined once live data lands.
 */
export function useDocumentMeta(weather: Weather): void {
  const { city, condition, temp, source } = weather;

  useEffect(() => {
    document.title = `${city} weather — live conditions & 7-day forecast`;
    if (source !== "live") return;

    setMeta(
      "description",
      `Live weather in ${city}: ${temp}°C and ${condition.toLowerCase()}. Hourly temperatures, a 7-day outlook, UV index and air quality.`,
    );
  }, [city, condition, temp, source]);
}
