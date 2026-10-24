import type { Weather } from "../data/weather";
import type { WeatherStatus } from "../lib/useWeather";

type Props = {
  city: string;
  updated: string;
  source: Weather["source"];
  status: WeatherStatus;
  onRetry: () => void;
};

export default function Footer({ city, updated, source, status, onRetry }: Props) {
  const note =
    status === "error"
      ? "Offline · last sync kept"
      : source === "live"
        ? "Live via Open-Meteo"
        : "Sample data";

  return (
    <footer className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 pt-6 pb-2 text-center text-[12px] text-muted-foreground">
      <span>
        {city} · {updated} · {note}
      </span>
      {status === "error" && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-card px-3 py-1 text-[11px] font-medium text-foreground shadow-card transition-transform duration-200 hover:scale-105"
        >
          Retry
        </button>
      )}
    </footer>
  );
}
