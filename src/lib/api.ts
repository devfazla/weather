/**
 * The only network calls that are not Open-Meteo. Each one is a Vercel
 * function that forwards to the Telegram bot; see /api/*.ts.
 */

import { readGeoHint } from "./location";

type Accepted = { ok: true };

async function post<T>(path: string, body: unknown, keepalive = false): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    keepalive,
  });

  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(detail?.error ?? `Request failed (${response.status})`);
  }

  return (await response.json().catch(() => ({ ok: true }))) as T;
}

export function sendContact(input: { name: string; email: string; message: string }) {
  return post<Accepted>("/api/contact", {
    ...input,
    page: location.pathname,
    geo: readGeoHint(),
  });
}

export function sendNewsletter(input: { email: string; source?: string; name?: string }) {
  return post<Accepted>("/api/subscribe", { ...input, geo: readGeoHint() });
}

export function reportClientError(input: {
  message: string;
  stack?: string;
  source?: string;
  path?: string;
}) {
  return post<Accepted>("/api/report", input, true);
}

/** Fire and forget: the page should never wait on a pageview. */
export function sendPageview(input: Record<string, unknown>): void {
  const body = { ...input, geo: readGeoHint() };
  const payload = JSON.stringify(body);

  if (navigator.sendBeacon?.("/api/track", new Blob([payload], { type: "application/json" }))) {
    return;
  }

  void post("/api/track", body, true).catch(() => undefined);
}
