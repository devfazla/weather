import {
  clientInfo,
  esc,
  mailto,
  notifyError,
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

type Body = { name?: string; email?: string; source?: string; geo?: GeoHint };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") return reply(res, 405, { error: "Use POST" });

  const body = await readJson<Body>(req);
  if (!body) return reply(res, 400, { error: "Expected a JSON body" });

  const name = text(body.name, 80);
  const email = text(body.email, 160);
  const source = text(body.source, 40) || "footer";
  const info = clientInfo(req, body.geo);

  if (!EMAIL.test(email)) return reply(res, 422, { error: "That address does not look right" });
  if (throttled(`subscribe:${info.ipHash}`, 10_000)) {
    return reply(res, 429, { error: "One signup at a time, please" });
  }

  const draft = mailto(email, "devFazla weather — newsletter");
  const address = `<a href="${esc(draft)}">${esc(email)}</a>`;

  const lines = [
    "📬 <b>Newsletter</b> — new subscriber",
    "",
    // Tapping the address opens a prefilled draft; buttons take HTTPS only.
    name ? `<b>${esc(name)}</b> · ${address}` : address,
    "",
    ...trace(info, source),
  ];

  try {
    await sendMessage(lines.join("\n"));
  } catch (error) {
    await notifyError("newsletter", error);
    return reply(res, 502, { error: "The signup could not be delivered" });
  }

  return reply(res, 200, { ok: true });
}
