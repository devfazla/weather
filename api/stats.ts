import { analyticsInbox, countryName, reply, statsToken, type ApiRequest, type ApiResponse } from "./_shared";
import { readDoc, top } from "./_stats";

/**
 * Reading the numbers back out. Guarded by STATS_TOKEN because the counters
 * are the site's own traffic, not public data.
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "GET") return reply(res, 405, { error: "Use GET" });

  const expected = statsToken();
  if (!expected) return reply(res, 501, { error: "Set STATS_TOKEN to enable this endpoint" });

  const url = new URL(req.url ?? "/", "https://weather.devfazla.com");
  const bearer = (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
  const provided = bearer || url.searchParams.get("token") || "";

  if (provided !== expected) return reply(res, 401, { error: "Unauthorized" });

  const chat = analyticsInbox();
  if (!chat) return reply(res, 503, { error: "Set TELEGRAM_ANALYTICS_CHAT_ID or TELEGRAM_CHAT_ID" });

  const { doc } = await readDoc(chat);

  return reply(res, 200, {
    ...doc,
    topCountries: top(doc.countries, 10).map(([code, hits]) => ({
      code,
      name: countryName(code) || "Unknown",
      hits,
    })),
    topPaths: top(doc.paths, 10).map(([path, hits]) => ({ path, hits })),
    topSources: top(doc.sources, 10).map(([source, hits]) => ({ source, hits })),
  });
}
