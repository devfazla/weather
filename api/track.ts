import {
  analyticsInbox,
  clientInfo,
  readJson,
  reply,
  text,
  throttled,
  type ApiRequest,
  type ApiResponse,
  type GeoHint,
} from "./_shared.js";
import { bump, CAPS, record } from "./_stats.js";

type Body = {
  path?: string;
  referrer?: string;
  session?: string;
  first?: boolean;
  screen?: string;
  lang?: string;
  utm?: { source?: string; medium?: string; campaign?: string };
  geo?: GeoHint;
};

/**
 * Drops the query and anything that is not path-ish. A path without a leading
 * slash is not a page, so it is refused rather than counted as "/".
 */
function cleanPath(value: unknown): string {
  const raw = text(value, 200).split("?")[0].split("#")[0];
  if (!raw.startsWith("/")) return "";

  return raw.replace(/[^\w\-./]/g, "").slice(0, 120) || "/";
}

function sourceOf(body: Body): string {
  const campaign = text(body.utm?.source, 40);
  if (campaign) return campaign.toLowerCase();

  try {
    const referrer = new URL(text(body.referrer, 300));
    if (!referrer.hostname || referrer.hostname === "weather.devfazla.com") return "internal";
    return referrer.hostname.replace(/^www\./, "").slice(0, 40);
  } catch {
    return "direct";
  }
}

/**
 * Country, region and city come from Vercel's edge headers, so the numbers do
 * not depend on anything the browser claims. Where there are no headers, as on
 * local dev or a self-host, the browser fills in what its own IP lookup found,
 * and a client can invent that. The visitor counts once per session: `first` is
 * set by the client on the opening pageview.
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") return reply(res, 405, { error: "Use POST" });

  const chat = analyticsInbox();
  // No analytics chat configured: accept and forget.
  if (!chat) return reply(res, 204);

  const body = await readJson<Body>(req);
  if (!body) return reply(res, 400, { error: "Expected a JSON body" });

  const info = clientInfo(req, body.geo);
  if (info.device === "bot") return reply(res, 204);

  const path = cleanPath(body.path);
  if (!path) return reply(res, 400, { error: "Bad path" });

  // A person cannot open more than one page a second; a script can.
  if (throttled(`track:${info.ipHash}`, 750)) return reply(res, 204);

  const country = info.country || "??";
  const source = sourceOf(body);
  const first = body.first === true;

  try {
    await record(chat, (doc) => {
      doc.views += 1;
      if (first) doc.sessions += 1;
      doc.countries = bump(doc.countries, country, CAPS.countries);
      doc.paths = bump(doc.paths, path, CAPS.paths);
      doc.sources = bump(doc.sources, source, CAPS.sources);
      doc.devices = bump(doc.devices, info.device, CAPS.devices);
    });
  } catch (error) {
    // The beacon is fire and forget: log it, keep the page moving.
    console.error("track failed", error);
  }

  return reply(res, 204);
}
