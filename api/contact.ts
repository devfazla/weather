import {
  clientInfo,
  esc,
  mailto,
  notifyError,
  pageUrl,
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

type Body = { name?: string; email?: string; message?: string; page?: string; geo?: GeoHint };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") return reply(res, 405, { error: "Use POST" });

  const body = await readJson<Body>(req);
  if (!body) return reply(res, 400, { error: "Expected a JSON body" });

  const name = text(body.name, 80);
  const email = text(body.email, 160);
  const message = text(body.message, 4000);
  const page = text(body.page, 120) || "/contact";
  const info = clientInfo(req, body.geo);

  if (!EMAIL.test(email)) return reply(res, 422, { error: "A reachable email is required" });
  if (message.length < 5) return reply(res, 422, { error: "The message is too short" });
  if (throttled(`contact:${info.ipHash}`, 15_000)) {
    return reply(res, 429, { error: "One message at a time, please" });
  }

  const who = name || "Anonymous";
  const draft = mailto(email, "Re: your message about the weather app");

  const lines = [
    "✉️ <b>New enquiry</b>",
    "",
    // The address is the reply link: Telegram allows HTTPS on buttons only, so
    // a prefilled draft has to live in the message itself.
    `<b>${esc(who)}</b> · <a href="${esc(draft)}">${esc(email)}</a>`,
    "",
    `<blockquote>${esc(message)}</blockquote>`,
    "",
    ...trace(info, page),
  ];

  const buttons = [{ label: "🌐 Open the page", url: pageUrl(page) }];

  try {
    await sendMessage(lines.join("\n"), undefined, buttons);
  } catch (error) {
    await notifyError("contact", error);
    return reply(res, 502, { error: "The message could not be delivered" });
  }

  return reply(res, 200, { ok: true });
}
