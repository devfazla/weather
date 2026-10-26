import type { ComponentType } from "react";
import { IconHumidity, IconSunLine, IconWind } from "./icons";

const icons: Record<string, ComponentType<{ className?: string }>> = {
  wind: IconWind,
  humidity: IconHumidity,
  uv: IconSunLine,
};

type Props = {
  metricKey: string;
  value: string;
  label: string;
};

/** One line inside the metrics panel, so the three readings share one surface. */
export default function MetricCard({ metricKey, value, label }: Props) {
  const Glyph = icons[metricKey] ?? IconSunLine;

  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-secondary text-secondary-foreground">
        <Glyph className="size-[17px]" />
      </span>
      <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-muted-foreground">{label}</p>
      <p className="shrink-0 font-heading text-[15px] font-bold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
