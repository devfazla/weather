import { reportClientError, sendPageview } from "./api";

const SESSION = "weather.session.v1";
const STARTED = "weather.started.v1";
const VISITS = "weather.visits.v1";

const read = (key: string): string | null => {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string): void => {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Private mode: the page still works, it just will not be counted twice.
  }
};

/**
 * Do Not Track, Global Privacy Control and ?noanalytics all keep the beacon off.
 * There is no cookie and no identifier that outlives the tab, so there is
 * nothing to consent to.
 */
function optedOut(): boolean {
  if (navigator.doNotTrack === "1") return true;
  if ((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true) {
    return true;
  }

  try {
    return new URLSearchParams(window.location.search).has("noanalytics");
  } catch {
    return false;
  }
}

function sessionId(): string {
  const existing = read(SESSION);
  if (existing) return existing;

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  write(SESSION, id);
  return id;
}

/** One beacon per route per tab, so client side navigation is not double counted. */
export function trackPageview(path: string): void {
  if (optedOut()) return;

  const seen = (read(VISITS) ?? "").split(",").filter(Boolean);
  if (seen.includes(path)) return;

  const first = read(STARTED) !== "1";
  write(VISITS, [...seen, path].join(","));
  if (first) write(STARTED, "1");

  const params = new URLSearchParams(window.location.search);

  sendPageview({
    path,
    session: sessionId(),
    first,
    referrer: document.referrer,
    screen: `${window.innerWidth}x${window.innerHeight}`,
    lang: navigator.language,
    utm: {
      source: params.get("utm_source") ?? "",
      medium: params.get("utm_medium") ?? "",
      campaign: params.get("utm_campaign") ?? "",
    },
  });
}

/**
 * Uncaught errors are worth knowing about, but a broken loop must not turn
 * into a flood: three per tab, one per distinct message.
 */
export function watchErrors(): void {
  let sent = 0;
  const seen = new Set<string>();

  const report = (message: string, stack?: string, source?: string) => {
    if (sent >= 3 || !message) return;

    const key = `${message}|${source ?? ""}`;
    if (seen.has(key)) return;

    seen.add(key);
    sent += 1;

    void reportClientError({ message, stack, source, path: window.location.pathname }).catch(
      () => undefined,
    );
  };

  window.addEventListener("error", (event) => {
    report(event.message || "Script error", event.error?.stack, event.filename);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason: unknown = event.reason;
    report(
      reason instanceof Error ? reason.message : String(reason),
      reason instanceof Error ? reason.stack : undefined,
      "promise",
    );
  });
}
