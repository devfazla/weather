import type { DayPoint } from "../data/weather";
import { degree, type Unit } from "../lib/format";
import { IconCalendar } from "./icons";
import WeatherIcon from "./WeatherIcon";

type Props = {
  week: DayPoint[];
  unit: Unit;
};

export default function WeekForecast({ week, unit }: Props) {
  return (
    <section className="flex h-full flex-col rounded-lg bg-card px-5 py-5 shadow-card md:px-6">
      <div className="flex items-center gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-sm bg-secondary text-secondary-foreground">
          <IconCalendar className="size-[19px]" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[18px] font-bold tracking-[-0.01em] text-foreground">This week</h2>
          <p className="mt-[3px] text-[12px] text-muted-foreground">Low to high, day by day</p>
        </div>
        <span className="ml-auto shrink-0 text-[12px] text-muted-foreground">
          {week.length} days
        </span>
      </div>

      {/* The rows spread out when the card is stretched by the one beside it. */}
      <ul className="flex flex-1 flex-col justify-between pt-1">
        {week.map((day, index) => (
          <li
            key={`${day.label}-${index}`}
            className="grid grid-cols-[46px_20px_32px_1fr_32px] items-center gap-2.5 py-[13px] sm:grid-cols-[56px_22px_36px_1fr_36px] sm:gap-3 sm:py-4"
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
