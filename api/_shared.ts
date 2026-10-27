import { createHash } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Shared plumbing for the Vercel functions in /api. Telegram is the only
 * store: submissions go straight to a chat, and the analytics counters live
 * in a pinned message that each visit rewrites.
 *
 * Every relative import in this folder names the compiled file, "./_stats.js"
 * from a .ts source. Vite bundles the frontend and takes either form, but each
 * file here runs as plain Node ESM on Vercel, and that loader will not guess an
 * extension: without it every function dies on boot with ERR_MODULE_NOT_FOUND
 * while the local build stays green.
 */

export type ApiRequest = IncomingMessage & { body?: unknown };
export type ApiResponse = ServerResponse;

/* ------------------------------------------------------------------ env */

export const inbox = () => process.env.TELEGRAM_CHAT_ID ?? "";

/** Where analytics and error notices land. Falls back to the inbox. */
export const analyticsInbox = () =>
  process.env.TELEGRAM_ANALYTICS_CHAT_ID || process.env.TELEGRAM_CHAT_ID || "";

export const statsToken = () => process.env.STATS_TOKEN ?? "";

export const hashSalt = () => process.env.ANALYTICS_SALT || "weather.devfazla.com";

/* ------------------------------------------------------------ telegram */

const ORIGIN = "https://api.telegram.org";

/**
 * One attempt's budget. Telegram answers a normal call in a few hundred ms, so
 * anything slower is a network in the way. Two short attempts fit inside Vercel's
 * default 10s function limit where one long one plus a retry would not.
 */
const ATTEMPT_MS = 6000;

export class TelegramError extends Error {
  constructor(
    message: string,
    readonly retryAfter?: number,
  ) {
    super(message);
    this.name = "TelegramError";
  }
}

export async function telegramCall<T>(
  method: string,
  payload: Record<string, unknown>,
): Promise<T> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new TelegramError("TELEGRAM_BOT_TOKEN is missing");

  const url = `${ORIGIN}/bot${token}/${method}`;
  const started = Date.now();
  let last: TelegramError | null = null;

  // Two attempts beat one: the usual local failure is a kept-alive socket to an
  // address Telegram has stopped using, and only a fresh connection cures it.
  // A retried send can duplicate a message that did get through. A second copy in
  // the chat costs far less than a lost enquiry.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(ATTEMPT_MS),
      });

      const data = (await response.json()) as {
        ok: boolean;
        result?: T;
        description?: string;
        parameters?: { retry_after?: number };
      };

      if (!data.ok) {
        throw new TelegramError(data.description ?? `${method} failed`, data.parameters?.retry_after);
      }

      return data.result as T;
    } catch (error) {
      // Telegram understood and refused: sending the same payload again is
      // pointless, and for a slow reply it would only delay the visitor.
      if (error instanceof TelegramError) throw error;

      // A bare TimeoutError says nothing useful. undici hides the real reason
      // (DNS, TLS, refused connection) one level down in `cause`.
      const cause = (error as { cause?: Error & { code?: string } }).cause;
      const why = cause?.code ?? cause?.message ?? (error as Error).message;
      const elapsed = Date.now() - started;
      last = new TelegramError(`${method}: no answer from Telegram after ${elapsed}ms (attempt ${attempt + 1}: ${why})`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  throw last ?? new TelegramError(`${method} failed`);
}

export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* -------------------------------------------------------- message shape */

/**
 * One inline button. Telegram has no colours, so the layout is type and space,
 * and it takes HTTPS URLs only. A mailto: here fails the whole send.
 */
export type Button = { label: string; url: string };

const SITE = "https://weather.devfazla.com";

/** 🇧🇩 from "BD". Anything else gives nothing, so the line just loses the flag. */
const flagOf = (code: string): string =>
  /^[A-Z]{2}$/.test(code)
    ? String.fromCodePoint(...[...code].map((char) => 127397 + char.charCodeAt(0)))
    : "";

/** Keeps order and drops blanks and repeats, since city and region often agree. */
const unique = (parts: string[]): string[] => [
  ...new Map(parts.filter((part) => part !== "").map((part) => [part.toLowerCase(), part])).values(),
];

const capitalise = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

/** "Desktop · Chrome on Windows", minus whatever the user agent did not say. */
const machine = (info: ClientInfo): string => {
  const browser = info.browser === "other" ? "" : `${info.browser} `;
  const system = info.os === "other" ? "" : `on ${info.os}`;

  return unique([capitalise(info.device), `${browser}${system}`.trim()]).join(" · ");
};

const stamp = (): string => `${new Date().toISOString().slice(11, 16)} UTC`;

/**
 * The two small print lines under a submission: where it came from, on what,
 * then the hashed IP and the time. Telegram already shows its own timestamp,
 * but that one is in the reader's zone, not a comparable one.
 */
export function trace(info: ClientInfo, note = ""): string[] {
  // Split first: the client hands over "Sylhet, Bangladesh" as one field, which
  // would otherwise print Bangladesh twice.
  const place = unique(
    [info.city, info.region, info.countryName].flatMap((part) => part.split(",")).map((part) => part.trim()),
  )
    .slice(0, 3)
    .join(", ");

  const where = place ? `${flagOf(info.country)} ${place}`.trim() : "Location unknown";

  return [
    `<i>${esc(where)} · ${esc(machine(info))}</i>`,
    `<code>${info.ipHash}</code> · ${stamp()}${note ? ` · ${esc(note)}` : ""}`,
  ];
}

/** Absolute link to whatever page the submission came from. */
export const pageUrl = (path: string): string =>
  `${SITE}${path.startsWith("/") ? path : `/${path}`}`;

export const mailto = (address: string, subject: string): string =>
  `mailto:${address}?subject=${encodeURIComponent(subject)}`;

/** Sends one message to the submissions chat (or the chat you name). */
export async function sendMessage(
  text: string,
  chatId = inbox(),
  buttons: Button[] = [],
): Promise<void> {
  if (!chatId) throw new TelegramError("TELEGRAM_CHAT_ID is missing");

  // One button per row: side by side they truncate, stacked they read. A URL
  // Telegram dislikes would sink the message along with it, so it is dropped.
  const rows = buttons
    .filter((button) => /^https?:\/\//i.test(button.url))
    .map((button) => [{ text: button.label, url: button.url }]);

  await telegramCall("sendMessage", {
    chat_id: chatId,
    text: text.slice(0, 4000),
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(rows.length ? { reply_markup: { inline_keyboard: rows } } : {}),
  });
}

/** Error notices share the analytics chat so the log stays a single stream. */
export async function notifyError(scope: string, error: unknown): Promise<void> {
  const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);

  // The notice is itself a Telegram message, so when Telegram is what failed this
  // is the only place the reason surfaces: the dev terminal and the Vercel logs.
  // Logged before the chat check: a missing chat is itself the reason.
  console.error(`[api:${scope}] ${detail}`);

  const chatId = analyticsInbox();
  if (!chatId) return;

  try {
    await sendMessage(
      `⚠️ <b>${esc(scope)}</b> failed\n\n<pre>${esc(detail.slice(0, 500))}</pre>`,
      chatId,
    );
  } catch {
    // Nothing left to do. The visitor was already told.
  }
}

/* --------------------------------------------------------------- http */

export async function readJson<T>(req: ApiRequest): Promise<T | null> {
  if (req.body && typeof req.body === "object") return req.body as T;

  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  if (chunks.length === 0) return null;

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function reply(res: ApiResponse, status: number, body: unknown = null): void {
  res.statusCode = status;
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(body === null ? "" : JSON.stringify(body));
}

export const text = (value: unknown, limit: number): string =>
  typeof value === "string" ? value.trim().slice(0, limit) : "";

const hits = new Map<string, number>();

/** One request per window per key. Per-instance, so it is a speed bump, not a wall. */
export function throttled(key: string, windowMs: number): boolean {
  const now = Date.now();
  const last = hits.get(key) ?? 0;

  if (now - last < windowMs) return true;

  hits.set(key, now);
  if (hits.size > 5000) hits.clear();
  return false;
}

/* --------------------------------------------------------- client info */

export type ClientInfo = {
  ip: string;
  ipHash: string;
  country: string;
  countryName: string;
  region: string;
  city: string;
  device: string;
  browser: string;
  os: string;
};

/**
 * What the browser learned from its own IP lookup. Only used where the platform
 * headers are missing. A client can write anything into it.
 */
export type GeoHint = { city?: string; region?: string; country?: string };

/**
 * A hint arrives as `null` from a visitor whose own IP lookup has not finished,
 * which is the first pageview of every session, so the empty object is applied
 * here rather than trusted to the caller.
 */
export function clientInfo(
  req: IncomingMessage,
  hint: GeoHint | null | undefined = {},
): ClientInfo {
  const place = hint ?? {};
  const header = (name: string) => {
    const value = req.headers[name];
    return (Array.isArray(value) ? value[0] : value) ?? "";
  };

  const decode = (value: string) => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  const ip = (header("x-forwarded-for").split(",")[0] ?? "").trim() || header("x-real-ip");
  const ua = header("user-agent");

  // A two-letter hint is an ISO code, a longer one is a country name. Anything
  // that is not two letters would make a nonsense code out of "Bangladesh".
  const named = text(place.country ?? "", 40);
  const code =
    header("x-vercel-ip-country").toUpperCase().slice(0, 2) ||
    (/^[A-Z]{2}$/.test(named) ? named : "");

  const fromHeader = (name: string) => decode(header(name)).slice(0, 40);

  return {
    ip,
    ipHash: createHash("sha256").update(`${ip}:${hashSalt()}`).digest("hex").slice(0, 12),
    country: code,
    countryName: code ? countryName(code) : named.length > 2 ? named : "",
    region: fromHeader("x-vercel-ip-country-region") || text(place.region ?? "", 40),
    city: fromHeader("x-vercel-ip-city") || text(place.city ?? "", 40),
    device: /bot|crawler|spider|crawl|slurp|curl|wget|headless/i.test(ua)
      ? "bot"
      : /ipad|tablet|playbook|silk/i.test(ua)
        ? "tablet"
        : /mobi|android|iphone|ipod/i.test(ua)
          ? "mobile"
          : "desktop",
    browser: /edg\//i.test(ua)
      ? "Edge"
      : /opr\/|opera/i.test(ua)
        ? "Opera"
        : /firefox\//i.test(ua)
          ? "Firefox"
          : /chrome|crios/i.test(ua)
            ? "Chrome"
            : /safari\//i.test(ua)
              ? "Safari"
              : "other",
    os: /windows/i.test(ua)
      ? "Windows"
      : /android/i.test(ua)
        ? "Android"
        : /iphone|ipad|ipod|ios/i.test(ua)
          ? "iOS"
          : /mac os/i.test(ua)
            ? "macOS"
            : /linux/i.test(ua)
              ? "Linux"
              : "other",
  };
}

export function countryName(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "";

  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
