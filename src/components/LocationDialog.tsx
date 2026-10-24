import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { Place } from "../data/weather";
import { reverseGeocode } from "../lib/location";
import { searchPlaces } from "../lib/openMeteo";
import { IconClose, IconLocate, IconPin, IconSearch } from "./icons";

type Props = {
  current: Place;
  onClose: () => void;
  onSave: (place: Place) => void;
};

const GEO_ERRORS: Record<number, string> = {
  1: "Permission denied. Allow location for this site in your browser settings, then try again.",
  2: "Your device couldn't get a position fix. Try again, or search for a city.",
  3: "The location request timed out. Try again, or search for a city.",
};

export default function LocationDialog({ current, onClose, onSave }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [pending, setPending] = useState<Place | null>(null);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock the page, focus the field, and let Escape back out.
  useEffect(() => {
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      root.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Debounced geocoding; the controller drops superseded keystrokes.
  useEffect(() => {
    const term = query.trim();

    if (term.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    setSearching(true);

    const timer = window.setTimeout(() => {
      searchPlaces(term, controller.signal)
        .then((places) => setResults(places))
        .catch(() => {
          if (!controller.signal.aborted) setResults([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, 280);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const pick = (place: Place) => {
    setPending(place);
    setMessage(null);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (results[0]) pick(results[0]);
  };

  const locateMe = async () => {
    setPending(null);
    setMessage(null);

    if (!("geolocation" in navigator)) {
      setMessage("This browser doesn't expose device location. Search for a city instead.");
      return;
    }

    if (!window.isSecureContext) {
      setMessage("Location only works over HTTPS or localhost. Search for a city instead.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        void reverseGeocode(latitude, longitude).then((resolved) => {
          setPending(
            resolved ?? {
              name: "My location",
              region: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
              lat: latitude,
              lon: longitude,
            },
          );
          setMessage(
            resolved
              ? `Found ${resolved.name}. Save to use it.`
              : "Got your coordinates. Save to use them.",
          );
          setLocating(false);
        });
      },
      (error) => {
        setMessage(GEO_ERRORS[error.code] ?? "Couldn't read your location. Search for a city instead.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 5 * 60_000 },
    );
  };

  const save = () => {
    if (!pending) return;
    onSave(pending);
    onClose();
  };

  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panelRef.current) return;

    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input, [href], [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const hint =
    query.trim().length >= 2
      ? searching
        ? "Searching…"
        : "No place found."
      : "Type at least two letters, or use this device.";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-5">
      <button
        type="button"
        aria-label="Close location dialog"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink-soft/35 backdrop-blur-[3px]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-title"
        onKeyDown={trapFocus}
        className="animate-pop relative w-full max-w-[440px] rounded-xl bg-card p-5 shadow-[0_40px_90px_-45px_rgba(8,26,36,0.6)] ring-1 ring-border sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="location-title"
              className="text-[20px] font-bold tracking-[-0.01em] text-foreground"
            >
              Change location
            </h2>
            <p className="mt-1 truncate text-[12px] text-muted-foreground">
              Now showing {current.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-card-soft text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <IconClose className="size-[15px]" />
          </button>
        </div>

        <form onSubmit={submitSearch} className="mt-5">
          <div className="flex h-11 items-center gap-2.5 rounded-md bg-input px-3.5 ring-1 ring-inset ring-border transition-shadow duration-200 focus-within:ring-2 focus-within:ring-primary/40">
            <IconSearch className="size-[17px] shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a city"
              aria-label="Search a city"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground/80"
            />
            {searching && (
              <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-primary" aria-hidden />
            )}
          </div>
        </form>

        {results.length > 0 ? (
          <ul className="thin-scroll mt-2 max-h-[46vh] overflow-y-auto pr-1.5" aria-label="Search results">
            {results.map((place) => {
              const active = pending?.lat === place.lat && pending?.lon === place.lon;

              return (
                <li key={`${place.lat},${place.lon}`}>
                  <button
                    type="button"
                    onClick={() => pick(place)}
                    aria-pressed={active}
                    className={[
                      "flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2.5 text-left transition-colors duration-150",
                      active
                        ? "bg-secondary text-secondary-foreground"
                        : "text-foreground hover:bg-card-soft",
                    ].join(" ")}
                  >
                    <IconPin className="size-[16px] shrink-0 opacity-70" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium">{place.name}</span>
                      {place.region && (
                        <span
                          className={[
                            "mt-[2px] block truncate text-[11px]",
                            active ? "opacity-80" : "text-muted-foreground",
                          ].join(" ")}
                        >
                          {place.region}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 min-h-[20px] px-1 text-[12px] text-muted-foreground">{hint}</p>
        )}

        <div className="mt-3 border-t border-border pt-2">
          <button
            type="button"
            onClick={locateMe}
            disabled={locating}
            aria-busy={locating}
            className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors duration-200 hover:bg-card-soft disabled:cursor-progress disabled:opacity-70"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
              <IconLocate className="size-[17px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold text-foreground">My location</span>
              <span className="mt-[2px] block truncate text-[12px] text-muted-foreground">
                {locating ? "Asking your browser…" : "Use this device's position"}
              </span>
            </span>
          </button>

          {message && (
            <p role="status" className="mt-1 px-2 text-[12px] leading-[1.55] text-muted-foreground">
              {message}
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
          <p className="min-w-0 truncate text-[12px] text-muted-foreground">
            {pending ? (
              <>
                Selected ·{" "}
                <span className="font-semibold text-foreground">{pending.name}</span>
              </>
            ) : (
              "Choose a place to save"
            )}
          </p>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-[10px] text-[14px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!pending}
              className="rounded-full bg-ink-soft px-5 py-[10px] text-[14px] font-semibold text-white transition-transform duration-200 enabled:hover:scale-[1.03] disabled:opacity-35"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
