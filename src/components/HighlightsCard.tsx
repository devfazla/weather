import type { ComponentType } from "react";
import type { Weather, WeatherKind } from "../data/weather";
import { IconSunset, IconWind } from "./icons";
import WeatherIcon from "./WeatherIcon";

type Props = {
  spotlight: Weather["spotlight"];
  kind: WeatherKind;
};

const glyphs: Record<string, ComponentType<{ className?: string }>> = {
  air: IconWind,
  sunset: IconSunset,
};

export default function HighlightsCard({ spotlight, kind }: Props) {
  const { headline, stats } = spotlight;

  return (
    <section className="relative flex flex-col overflow-hidden rounded-lg bg-ink-soft px-5 pb-6 pt-6 text-white sm:px-7 sm:pt-7">
      {/* Warm light off the top edge, so the dark surface isn't a flat slab. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-28 h-60 bg-[radial-gradient(120%_90%_at_50%_-30%,rgba(240,166,60,0.14),transparent_68%)]"
      />

      <span className="relative grid size-10 shrink-0 place-items-center rounded-md bg-white/10 ring-1 ring-inset ring-white/15">
        <WeatherIcon kind={kind} className="size-5" />
      </span>

      <p className="relative mt-5 text-balance font-heading text-[26px] font-bold leading-[1.24] tracking-[-0.02em] sm:text-[30px] sm:leading-[1.2]">
        {headline}
      </p>

      {/* Label recedes, the reading is what gets emphasised. Under sm the long
          air-quality value would crush the label, so the row turns vertical. */}
      <dl className="relative mt-6">
        {stats.map((stat) => {
          const Glyph = glyphs[stat.icon] ?? IconWind;
          return (
            <div
              key={stat.label}
              data-stat
              className="flex flex-col items-start gap-1 border-t border-white/10 py-3.5 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
            >
              <dt className="flex min-w-0 items-center gap-2 text-[12px] font-medium uppercase tracking-[0.05em] text-white/50">
                <Glyph className="size-4 shrink-0" />
                <span className="truncate">{stat.label}</span>
              </dt>
              <dd className="shrink-0 font-heading text-[15px] font-bold tabular-nums sm:text-right">
                {stat.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
