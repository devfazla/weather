import type { ComponentType } from "react";
import type { WeatherKind } from "../data/weather";
import { WeatherCloud, WeatherPartly, WeatherSun, WeatherSunLow } from "./icons";

const glyphs: Record<WeatherKind, ComponentType<{ className?: string }>> = {
  sun: WeatherSun,
  partly: WeatherPartly,
  cloud: WeatherCloud,
  low: WeatherSunLow,
};

export default function WeatherIcon({
  kind,
  className = "size-5",
}: {
  kind: WeatherKind;
  className?: string;
}) {
  const Glyph = glyphs[kind];
  return <Glyph className={className} />;
}
