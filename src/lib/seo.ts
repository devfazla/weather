import { useEffect } from "react";
import type { Weather } from "../data/weather";

/** Per-route head content. Pass a module-level constant, not an inline object. */
type PageMeta = {
  title: string;
  description: string;
  canonical: string;
  /** Overrides the indexing permission in index.html for as long as the route is up. */
  robots?: string;
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
export function usePageMeta({ title, description, canonical, robots, schema }: PageMeta): void {
  useEffect(() => {
    document.title = title;
    setMeta("description", description);
    document.head.querySelector('link[rel="canonical"]')?.setAttribute("href", canonical);

    // index.html says a crawler may index. A route that disagrees swaps the
    // value while it is up and hands the original back on the way out.
    const robotsTag = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const robotsWas = robotsTag?.content;
    if (robotsTag && robots) robotsTag.content = robots;

    let schemaTag: HTMLScriptElement | undefined;
    if (schema) {
      schemaTag = document.createElement("script");
      schemaTag.type = "application/ld+json";
      schemaTag.textContent = JSON.stringify(schema);
      document.head.append(schemaTag);
    }

    return () => {
      schemaTag?.remove();
      if (robotsTag && robotsWas) robotsTag.content = robotsWas;
    };
  }, [title, description, canonical, robots, schema]);
}

/**
 * Keeps the tab title and the meta description in step with the city on
 * screen. The tags in index.html stay the crawlable default (they describe the
 * page before the first forecast lands) and only get refined once live data lands.
 */
export function useDocumentMeta(weather: Weather): void {
  const { city, condition, temp, source } = weather;

  useEffect(() => {
    document.title = `${city} weather, live conditions & 7-day forecast`;
    if (source !== "live") return;

    setMeta(
      "description",
      `Live weather in ${city}: ${temp}°C and ${condition.toLowerCase()}. Hourly temperatures, a 7-day outlook, UV index and air quality.`,
    );
  }, [city, condition, temp, source]);
}
