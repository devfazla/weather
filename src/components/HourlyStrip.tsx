import type { HourPoint } from "../data/weather";
import { degree, type Unit } from "../lib/format";
import WeatherIcon from "./WeatherIcon";

type Props = {
  hourly: HourPoint[];
  unit: Unit;
};

export default function HourlyStrip({ hourly, unit }: Props) {
  return (
    <section className="rounded-lg bg-card p-2 shadow-card" aria-label="Hourly forecast">
      {/* One line of eight from md up; on a phone it wraps to two rows of four. */}
      <ul className="grid grid-cols-4 gap-2 md:grid-cols-8">
        {hourly.map((hour, index) => {
          const active = index === 0;
          return (
            <li
              key={`${hour.label}-${index}`}
              className={[
                "flex flex-col items-center rounded-md px-2 py-4",
                active ? "bg-ink-soft text-white" : "bg-card-soft text-foreground",
              ].join(" ")}
            >
              <span className="text-[12px] font-medium">{hour.label}</span>
              <span className="my-3.5">
                <WeatherIcon kind={hour.kind} className="size-[19px]" />
              </span>
              <span className="font-heading text-[16px] font-bold tabular-nums">
                {degree(hour.temp, unit)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
