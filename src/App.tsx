import { useState } from "react";
import type { Unit } from "./lib/format";
import { useDocumentMeta, usePageMeta } from "./lib/seo";
import { useTheme } from "./lib/theme";
import { useWeather } from "./lib/useWeather";
import Header from "./components/Header";
import HeroCard from "./components/HeroCard";
import HourlyStrip from "./components/HourlyStrip";
import WeekForecast from "./components/WeekForecast";
import HighlightsCard from "./components/HighlightsCard";
import MetricCard from "./components/MetricCard";
import Footer from "./components/Footer";
import LocationDialog from "./components/LocationDialog";

const HOME_META = {
  title: "Live weather — hourly & 7-day forecast · devFazla",
  description:
    "Live weather for any city: current conditions, hourly temperatures, 7-day outlook, UV index and air quality. Free, no sign-up, updated every 10 minutes.",
  canonical: "https://weather.devfazla.com/",
};

export default function App() {
  const [unit, setUnit] = useState<Unit>("C");
  const { dark, toggle } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { place, weather, status, locating, choosePlace, retry } = useWeather();
  usePageMeta(HOME_META);
  useDocumentMeta(weather);
  const statusText = locating
    ? "Finding your area…"
    : status === "loading"
      ? "Updating…"
      : weather.status;

  return (
    <div className="min-h-dvh px-4 pt-6 pb-2 md:px-6 md:pt-8">
      <div className="mx-auto w-full max-w-[760px] xl:max-w-[1060px]">
        <Header
          city={weather.city}
          status={statusText}
          unit={unit}
          onUnitChange={setUnit}
          dark={dark}
          onToggleTheme={toggle}
          onChangeLocation={() => setDialogOpen(true)}
        />

        <main className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
          <div
            className="animate-rise md:col-span-2 xl:col-span-12"
            style={{ animationDelay: "40ms" }}
          >
            <HeroCard weather={weather} unit={unit} />
          </div>

          <div
            className="animate-rise md:col-span-2 xl:col-span-12"
            style={{ animationDelay: "110ms" }}
          >
            <HourlyStrip hourly={weather.hourly} unit={unit} />
          </div>

          <div
            className="animate-rise md:col-span-1 xl:col-span-7"
            style={{ animationDelay: "180ms" }}
          >
            <WeekForecast week={weather.week} unit={unit} />
          </div>

          <div className="flex flex-col gap-4 md:col-span-1 xl:col-span-5">
            <div className="animate-rise" style={{ animationDelay: "240ms" }}>
              <HighlightsCard
                spotlight={weather.spotlight}
                kind={weather.hourly[0].kind}
              />
            </div>

            {/* The metrics ride in the same rail, one panel of hairline rows. */}
            <div className="divide-y divide-border rounded-lg bg-card shadow-card">
              {weather.metrics.map((metric) => (
                <MetricCard
                  key={metric.key}
                  metricKey={metric.key}
                  value={metric.value}
                  label={metric.label}
                />
              ))}
            </div>
          </div>
        </main>

        <Footer status={status} onRetry={retry} />
      </div>

      {dialogOpen && (
        <LocationDialog
          current={place}
          onClose={() => setDialogOpen(false)}
          onSave={choosePlace}
        />
      )}
    </div>
  );
}
