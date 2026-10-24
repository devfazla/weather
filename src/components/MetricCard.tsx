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

export default function MetricCard({ metricKey, value, label }: Props) {
  const Glyph = icons[metricKey] ?? IconSunLine;

  return (
    <div className="flex items-center gap-4 rounded-lg bg-card px-6 py-[19px] shadow-card">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
        <Glyph className="size-[19px]" />
      </span>
      <div className="min-w-0">
        <p className="truncate font-heading text-[16px] font-bold leading-tight text-foreground">
          {value}
        </p>
        <p className="mt-[4px] text-[12px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
