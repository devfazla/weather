import { countryName, esc, TelegramError, telegramCall } from "./_shared.js";

/**
 * Telegram is the database: one pinned message holds the counters as JSON
 * inside <pre>, and every visit reads it, increments it and writes it back.
 * The bot has to be an admin in the analytics chat to pin and edit.
 */

export type StatsDoc = {
  v: 1;
  since: string;
  updated: string;
  views: number;
  sessions: number;
  countries: Record<string, number>;
  paths: Record<string, number>;
  sources: Record<string, number>;
  devices: Record<string, number>;
};

const BLOCK = /<pre>([\s\S]*?)<\/pre>/;

/**
 * Telegram keeps the JSON but not the markup: parse_mode HTML turns <pre> into a
 * message entity, so the stored text has no literal tags to match. Read the
 * object by its braces, which still covers the wrapped form the local mock hands
 * back.
 */
function jsonOf(text: string): string {
  const body = BLOCK.exec(text)?.[1] ?? text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");

  return start === -1 || end <= start ? "" : body.slice(start, end + 1);
}

/** Keeps the document inside Telegram's 4096 character message limit. */
export const CAPS = { countries: 60, paths: 25, sources: 15, devices: 4 };

type Chat = { id: number; pinned_message?: { message_id: number; text?: string } };

export function emptyDoc(): StatsDoc {
  const now = new Date().toISOString();
  return {
    v: 1,
    since: now,
    updated: now,
    views: 0,
    sessions: 0,
    countries: {},
    paths: {},
    sources: {},
    devices: {},
  };
}

/** Counts one hit and keeps only the busiest keys. */
export function bump(map: Record<string, number>, key: string, cap: number): Record<string, number> {
  const next: Record<string, number> = { ...map, [key]: (map[key] ?? 0) + 1 };
  const entries = Object.entries(next)
    .sort((a, b) => b[1] - a[1])
    .slice(0, cap);

  return Object.fromEntries(entries);
}

export const top = (map: Record<string, number>, count: number): [string, number][] =>
  Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count);

export async function readDoc(chatId: string): Promise<{ doc: StatsDoc; messageId: number | null }> {
  const chat = await telegramCall<Chat>("getChat", { chat_id: chatId });
  const pinned = chat.pinned_message;
  const raw = pinned?.text ? jsonOf(pinned.text) : "";

  let doc = emptyDoc();
  // The pin is only claimed once it reads as our document, so an unrelated
  // pinned message is left alone instead of being overwritten.
  let messageId: number | null = null;

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as StatsDoc;
      if (parsed.v === 1) {
        doc = { ...emptyDoc(), ...parsed };
        messageId = pinned?.message_id ?? null;
      }
    } catch {
      // A hand-edited or truncated document starts over rather than 500ing.
    }
  }

  return { doc, messageId };
}

function render(doc: StatsDoc): string {
  const since = new Date(doc.since).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  const countries = top(doc.countries, 6)
    .map(([code, hits]) => `${esc(countryName(code) || "Unknown")} ${hits}`)
    .join(" · ");

  const pages = top(doc.paths, 4)
    .map(([path, hits]) => `${esc(path)} ${hits}`)
    .join(" · ");

  const json = JSON.stringify(doc);
  const plural = (count: number, word: string) => `${count.toLocaleString("en-US")} ${word}${count === 1 ? "" : "s"}`;
  const summary = [
    "📊 <b>Weather analytics</b>",
    `${plural(doc.views, "view")} · ${plural(doc.sessions, "session")} · since ${since}`,
    ...(countries ? [`\n🌍 <b>Countries</b>\n${countries}`] : []),
    ...(pages ? [`\n🧭 <b>Pages</b>\n${pages}`] : []),
    "",
    `<pre>${esc(json)}</pre>`,
  ].join("\n");

  // The JSON is the state, so the readable summary is what gives way.
  return summary.length <= 4000 ? summary : `<pre>${esc(json)}</pre>`;
}

export async function writeDoc(doc: StatsDoc, messageId: number | null, chatId: string): Promise<void> {
  doc.updated = new Date().toISOString();
  const text = render(doc);

  if (messageId === null) {
    const sent = await telegramCall<{ message_id: number }>("sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });

    await telegramCall("pinChatMessage", {
      chat_id: chatId,
      message_id: sent.message_id,
      disable_notification: true,
    });
    return;
  }

  try {
    await telegramCall("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  } catch (error) {
    // Two visits landing together can produce the same text; that is not a failure.
    if (error instanceof TelegramError && /message is not modified/i.test(error.message)) return;
    throw error;
  }
}

/**
 * One writer at a time per chat, inside this instance. Two beacons landing
 * together would otherwise read the same document and drop one of them.
 */
const queues = new Map<string, Promise<unknown>>();

/** Read, increment, write. Retried when Telegram asks us to slow down. */
async function apply(
  chatId: string,
  change: (doc: StatsDoc) => void,
  attempts: number,
): Promise<StatsDoc> {
  let last: unknown = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const { doc, messageId } = await readDoc(chatId);
    change(doc);

    try {
      await writeDoc(doc, messageId, chatId);
      return doc;
    } catch (error) {
      last = error;
      // A long back-off costs more than the view is worth on a 10s budget.
      const wait = error instanceof TelegramError ? error.retryAfter : undefined;
      if (!wait || wait > 4) break;
      await new Promise((resolve) => setTimeout(resolve, wait * 1000));
    }
  }

  throw last ?? new Error("Could not update the analytics document");
}

export function record(
  chatId: string,
  change: (doc: StatsDoc) => void,
  attempts = 3,
): Promise<StatsDoc> {
  const queued = (queues.get(chatId) ?? Promise.resolve())
    .catch(() => undefined)
    .then(() => apply(chatId, change, attempts));

  queues.set(chatId, queued.catch(() => undefined));

  return queued;
}
