/**
 * localStorage-backed cache for the Open-Meteo calls.
 *
 * The free tier allows 10,000 calls/day, so a dashboard reload shouldn't spend
 * a call per mount. Entries are keyed by request URL (coordinates are rounded
 * by the caller) and expire per product; concurrent callers for the same URL
 * share a single request.
 */

const PREFIX = "open-meteo:v1:";
const inFlight = new Map<string, Promise<unknown>>();

type Entry<T> = { savedAt: number; value: T };

function readEntry<T>(url: string): Entry<T> | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + url);
    return raw ? (JSON.parse(raw) as Entry<T>) : null;
  } catch {
    return null;
  }
}

function writeEntry<T>(url: string, value: T): void {
  try {
    window.localStorage.setItem(PREFIX + url, JSON.stringify({ savedAt: Date.now(), value }));
  } catch {
    // Private mode or a full quota — caching is optional, keep going.
  }
}

/** Rejects as soon as the caller aborts, without cancelling the shared request. */
function withAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(new DOMException("Aborted", "AbortError"));

  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(new DOMException("Aborted", "AbortError"));
    signal.addEventListener("abort", abort, { once: true });

    promise.then(
      (value) => {
        signal.removeEventListener("abort", abort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", abort);
        reject(error);
      },
    );
  });
}

export async function cachedJson<T>(
  url: string,
  ttlMs: number,
  signal?: AbortSignal,
): Promise<T> {
  const entry = readEntry<T>(url);

  if (entry && Date.now() - entry.savedAt < ttlMs) {
    return entry.value;
  }

  let request = inFlight.get(url) as Promise<T> | undefined;

  if (!request) {
    request = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Open-Meteo responded ${response.status}`);
        return response.json() as Promise<T>;
      })
      .then((data) => {
        writeEntry(url, data);
        return data;
      })
      .finally(() => inFlight.delete(url));

    inFlight.set(url, request);
  }

  try {
    return await withAbort(request, signal);
  } catch (error) {
    // Offline or rate-limited: an expired snapshot beats an empty card.
    if (entry) return entry.value;
    throw error;
  }
}
