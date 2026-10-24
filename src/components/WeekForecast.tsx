import type { DayPoint } from "../data/weather";
import { degree, type Unit } from "../lib/format";
import WeatherIcon from "./WeatherIcon";

type Props = {
  week: DayPoint[];
  unit: Unit;
};

export default function WeekForecast({ week, unit }: Props) {
  return (
    <section className="flex h-full flex-col rounded-lg bg-card px-5 py-5 shadow-card md:px-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[18px] font-bold tracking-[-0.01em] text-foreground">This week</h2>
        <span className="text-[12px] text-muted-foreground">{week.length} days</span>
      </div>

      <ul className="mt-1">
        {week.map((day, index) => (
          <li
            key={`${day.label}-${index}`}
            className={[
              "grid grid-cols-[46px_20px_32px_1fr_32px] items-center gap-2.5 py-4 sm:grid-cols-[56px_22px_36px_1fr_36px] sm:gap-3",
              index > 0 ? "border-t border-border" : "",
            ].join(" ")}
          >
            <span className="text-[14px] font-medium text-foreground">{day.label}</span>
            <WeatherIcon kind={day.kind} className="size-[19px] text-foreground" />
            <span className="font-heading text-[14px] font-semibold tabular-nums text-foreground">
              {degree(day.low, unit)}
            </span>

            <span className="relative block h-[5px] w-full rounded-full range-bar">
              <span
                className="absolute top-1/2 size-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-foreground bg-card"
                style={{ left: `${day.pct}%` }}
                aria-hidden
              />
            </span>

            <span className="text-right font-heading text-[14px] font-semibold tabular-nums text-foreground">
              {degree(day.high, unit)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
