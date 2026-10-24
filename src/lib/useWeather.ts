import { useCallback, useEffect, useState } from "react";
import {
  defaultPlace,
  fallbackWeather,
  type Place,
  type Weather,
} from "../data/weather";
import { detectPlaceByIp, readSavedPlace, savePlace } from "./location";
import { fetchWeather } from "./openMeteo";

export type WeatherStatus = "loading" | "ready" | "error";

/**
 * Owns the active place and its forecast. On a first visit the place comes from
 * the visitor's IP; afterwards the saved choice wins. The previous snapshot
 * stays mounted while a new one loads, and survives a failed request, so the
 * dashboard never flashes empty.
 */
export function useWeather() {
  // Read the saved choice once, so saving later doesn't restart this effect.
  const [saved] = useState(readSavedPlace);
  const [place, setPlace] = useState<Place>(saved ?? defaultPlace);
  const [locating, setLocating] = useState(!saved);
  const [weather, setWeather] = useState<Weather>(fallbackWeather);
  const [status, setStatus] = useState<WeatherStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (saved) return;

    let cancelled = false;

    detectPlaceByIp()
      .then((detected) => {
        if (cancelled || !detected) return;
        setPlace(detected);
      })
      .catch(() => {
        // Fall back to the default city below.
      })
      .finally(() => {
        if (!cancelled) setLocating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [saved]);

  useEffect(() => {
    // Wait for the IP lookup, otherwise the default city costs a wasted call.
    if (locating) return;

    const controller = new AbortController();
    setStatus("loading");

    fetchWeather(place, controller.signal)
      .then((next) => {
        setWeather(next);
        setStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });

    return () => controller.abort();
  }, [place, attempt, locating]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  const choosePlace = useCallback((next: Place) => {
    savePlace(next);
    setPlace(next);
  }, []);

  return { place, weather, status, locating, choosePlace, retry };
}
