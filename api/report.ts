import {
  analyticsInbox,
  clientInfo,
  esc,
  readJson,
  reply,
  sendMessage,
  text,
  throttled,
  trace,
  type ApiRequest,
  type ApiResponse,
  type GeoHint,
} from "./_shared.js";

type Body = {
  message?: string;
  stack?: string;
  source?: string;
  path?: string;
  geo?: GeoHint;
};

/** Client errors land in the analytics chat, next to the traffic counters. */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") return reply(res, 405, { error: "Use POST" });

  const chat = analyticsInbox();
  if (!chat) return reply(res, 204);

  const body = await readJson<Body>(req);
  if (!body?.message) return reply(res, 400, { error: "Expected a message" });

  const info = clientInfo(req, body.geo);
  if (throttled(`report:${info.ipHash}`, 20_000)) return reply(res, 204);

  const path = text(body.path, 120) || "/";

  const lines = [
    "🐞 <b>Client error</b>",
    "",
    `<b>${esc(text(body.message, 300))}</b>`,
    "",
    ...trace(info, path),
    // The stack is optional; a blank line keeps it off the meta row.
    ...(body.stack ? ["", `<pre>${esc(text(body.stack, 900))}</pre>`] : []),
  ];

  const report = lines.join("\n");

  try {
    await sendMessage(report, chat);
  } catch (error) {
    console.error("report failed", error);
  }

  return reply(res, 204);
}
