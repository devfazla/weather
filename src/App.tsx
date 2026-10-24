import { useEffect, useState } from "react";
import type { Unit } from "./lib/format";
import { useWeather } from "./lib/useWeather";
import Header from "./components/Header";
import HeroCard from "./components/HeroCard";
import HourlyStrip from "./components/HourlyStrip";
import WeekForecast from "./components/WeekForecast";
import HighlightsCard from "./components/HighlightsCard";
import TipBanner from "./components/TipBanner";
import MetricCard from "./components/MetricCard";
import Footer from "./components/Footer";
import LocationDialog from "./components/LocationDialog";

export default function App() {
  const [unit, setUnit] = useState<Unit>("C");
  const [dark, setDark] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { place, weather, status, locating, choosePlace, retry } = useWeather();
  const statusText = locating
    ? "Finding your area…"
    : status === "loading"
      ? "Updating…"
      : weather.status;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
  }, [dark]);

  return (
    <div className="min-h-dvh px-4 pt-6 pb-2 md:px-6 md:pt-8">
      <div className="mx-auto w-full max-w-[760px] xl:max-w-[1060px]">
        <Header
          city={weather.city}
          status={statusText}
          unit={unit}
          onUnitChange={setUnit}
          dark={dark}
          onToggleTheme={() => setDark((value) => !value)}
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
              <HighlightsCard spotlight={weather.spotlight} />
            </div>
            <div className="animate-rise" style={{ animationDelay: "300ms" }}>
              <TipBanner tip={weather.tip} />
            </div>

            {/* tablet: metrics stack in the side column */}
            <div className="grid gap-3 xl:hidden">
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

          {/* desktop: metrics in one row */}
          <div className="hidden grid-cols-3 gap-4 xl:col-span-12 xl:grid">
            {weather.metrics.map((metric) => (
              <MetricCard
                key={metric.key}
                metricKey={metric.key}
                value={metric.value}
                label={metric.label}
              />
            ))}
          </div>
        </main>

        <Footer
          city={weather.city}
          updated={weather.updated}
          source={weather.source}
          status={status}
          onRetry={retry}
        />
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
