import { useEffect, useRef, useState } from "react";
import type { Weather } from "../data/weather";
import { degree, toUnit, type Unit } from "../lib/format";
import { fallbackHero, type HeroScene } from "../lib/heroImage";
import { IconArrowUpRight, IconSunrise, IconSunset, WeatherSun } from "./icons";

type Props = {
  weather: Weather;
  unit: Unit;
};

export default function HeroCard({ weather, unit }: Props) {
  const { badge, temp, condition, high, low, feels, sunrise, sunset, photo, hero } = weather;

  return (
    <section className="rounded-xl bg-card p-4 shadow-card">
      <div className="grid gap-4 md:grid-cols-[1.06fr_1fr] xl:grid-cols-[1fr_0.94fr]">
        {/* ------------------------------------------------------ left side */}
        <div className="flex flex-col px-2.5 pb-3 pt-6 md:px-3 md:pb-4 md:pt-7 xl:px-7 xl:pb-6 xl:pt-8">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-sun-soft px-3.5 py-2 text-[12px] font-semibold text-sun-ink">
            <span className="size-[6px] rounded-full bg-sun" aria-hidden />
            {badge}
          </span>

          <p className="mt-4 font-heading text-[clamp(64px,9vw,120px)] font-extrabold leading-[0.86] tracking-[-0.03em] text-foreground xl:mt-5">
            {toUnit(temp, unit)}°
          </p>

          <h2 className="mt-6 text-[24px] font-bold leading-none tracking-[-0.01em] text-foreground">
            {condition}
          </h2>
          <p className="mt-2.5 text-[14px] text-muted-foreground">
            H {degree(high, unit)} · L {degree(low, unit)} · Feels {degree(feels, unit)}
          </p>

          <div className="mt-14 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-4 py-[11px] text-[14px] font-medium text-foreground">
              <IconSunrise className="size-[17px]" />
              {sunrise}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-4 py-[11px] text-[14px] font-medium text-foreground">
              <IconSunset className="size-[17px]" />
              {sunset}
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------- right side */}
        <div className="relative min-h-[280px] overflow-hidden rounded-lg bg-card-soft md:min-h-[356px] xl:min-h-[400px]">
          <HeroPhoto key={hero.src} hero={hero} />

          <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-md bg-white/95 p-2 shadow-[0_14px_30px_-20px_rgba(8,26,36,0.65)] ring-1 ring-black/5 backdrop-blur-sm sm:inset-x-3.5 sm:bottom-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sun-soft text-sun">
              <WeatherSun className="size-[17px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold leading-tight text-[#142430]">
                {photo.title}
              </p>
              <p className="mt-[2px] truncate text-[12px] text-[#71838f]">{photo.note}</p>
            </div>
            <button
              type="button"
              aria-label="Open outside conditions"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-[#16252e] text-white transition-transform duration-200 hover:scale-105"
            >
              <IconArrowUpRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The photo and the scrims that keep the note chip legible over it. Keyed on
 * the source in HeroCard, so a change in the weather fades in instead of popping.
 */
function HeroPhoto({ hero }: { hero: HeroScene }) {
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const scene = broken ? fallbackHero : hero;

  // A cached image can finish before React attaches onLoad.
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  return (
    <>
      <img
        ref={ref}
        src={scene.src}
        alt={scene.alt}
        onLoad={() => setLoaded(true)}
        // Anything missing still leaves the card with the clear-sky shot.
        onError={() => setBroken(true)}
        loading="eager"
        decoding="async"
        className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b to-transparent ${
          scene.scrim === "strong" ? "from-black/40" : "from-black/20"
        }`}
        aria-hidden
      />
      <div
        className={`absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t to-transparent ${
          scene.scrim === "strong" ? "from-black/45" : "from-black/25"
        }`}
        aria-hidden
      />

      {scene.credit && (
        <a
          href={scene.source ?? undefined}
          target="_blank"
          rel="noreferrer noopener"
          title={`Photo: ${scene.credit}`}
          className="absolute right-2.5 top-2.5 max-w-[80%] truncate rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-[2px] transition-colors duration-200 hover:bg-black/55 hover:text-white"
        >
          {scene.credit}
        </a>
      )}
    </>
  );
}
