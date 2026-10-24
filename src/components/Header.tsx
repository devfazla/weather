import type { Unit } from "../lib/format";
import { IconChevronDown, IconMoon, IconPin, IconSearch, IconSunLine } from "./icons";

type Props = {
  city: string;
  status: string;
  unit: Unit;
  onUnitChange: (unit: Unit) => void;
  dark: boolean;
  onToggleTheme: () => void;
  onChangeLocation: () => void;
};

const unitClass = (active: boolean) =>
  [
    "h-full rounded-full px-4 text-[14px] transition-colors duration-200",
    active
      ? "bg-ink-soft font-semibold text-white"
      : "font-medium text-muted-foreground hover:text-foreground",
  ].join(" ");

export default function Header({
  city,
  status,
  unit,
  onUnitChange,
  dark,
  onToggleTheme,
  onChangeLocation,
}: Props) {
  return (
    <header className="flex items-center justify-between gap-3">
      <h1 className="sr-only">{city} weather</h1>

      <button
        type="button"
        onClick={onChangeLocation}
        aria-label={`Change location, now showing ${city}`}
        className="group -m-1 flex min-w-0 items-center gap-3 rounded-full pl-1 pr-3 py-1 text-left transition-colors duration-200 hover:bg-card/60"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-foreground shadow-card transition-transform duration-200 group-hover:scale-105">
          <IconPin className="size-[18px]" />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[18px] font-bold leading-tight tracking-[-0.01em] text-foreground">
              {city}
            </span>
            <IconChevronDown className="size-[14px] shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-foreground" />
          </span>
          <span className="mt-[2px] block truncate text-[12px] font-medium text-muted-foreground">
            {status}
          </span>
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onChangeLocation}
          aria-label="Search for a place"
          className="hidden h-10 items-center gap-2 rounded-full bg-card/70 pl-4 pr-1.5 ring-1 ring-inset ring-white/60 transition-colors duration-200 hover:bg-card sm:flex"
        >
          <span className="text-[14px] text-muted-foreground">Search place</span>
          <span className="grid size-7 place-items-center rounded-full bg-secondary text-secondary-foreground">
            <IconSearch className="size-[14px]" />
          </span>
        </button>

        <div
          role="group"
          aria-label="Temperature unit"
          className="flex h-10 items-center rounded-full bg-card p-1 shadow-card"
        >
          <button
            type="button"
            onClick={() => onUnitChange("C")}
            aria-pressed={unit === "C"}
            className={unitClass(unit === "C")}
          >
            C°
          </button>
          <button
            type="button"
            onClick={() => onUnitChange("F")}
            aria-pressed={unit === "F"}
            className={unitClass(unit === "F")}
          >
            °F
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={dark}
          className="grid size-10 place-items-center rounded-full bg-card text-foreground shadow-card transition-transform duration-200 hover:scale-105"
        >
          {dark ? <IconSunLine className="size-[17px]" /> : <IconMoon className="size-[17px]" />}
        </button>
      </div>
    </header>
  );
}
