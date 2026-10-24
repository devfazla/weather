export type Unit = "C" | "F";

/** Celsius in, display number out. */
export function toUnit(celsius: number, unit: Unit): number {
  return unit === "C" ? celsius : Math.round((celsius * 9) / 5 + 32);
}

/** "21" -> "21°" in the active unit. */
export function degree(celsius: number, unit: Unit): string {
  return `${toUnit(celsius, unit)}°`;
}

function hour12(hour: number): number {
  return hour % 12 || 12;
}

/**
 * Open-Meteo returns wall-clock strings for the location's own zone
 * ("2026-10-23T07:26"), so slicing is safer than parsing into the browser zone.
 * "2026-10-23T07:26" -> "7:26 AM"
 */
export function clockLabel(iso: string): string {
  const hour = Number(iso.slice(11, 13));
  return `${hour12(hour)}:${iso.slice(14, 16)} ${hour < 12 ? "AM" : "PM"}`;
}

/** "2026-10-23T15:00" -> "3PM" */
export function hourLabel(iso: string): string {
  const hour = Number(iso.slice(11, 13));
  return `${hour12(hour)}${hour < 12 ? "AM" : "PM"}`;
}

/** "2026-10-26" -> "Mon" (noon UTC keeps the date from rolling over) */
export function weekdayLabel(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
}

/** WHO UV scale bucket. */
export function uvRating(value: number): string {
  if (value >= 11) return "Extreme";
  if (value >= 8) return "Very high";
  if (value >= 6) return "High";
  if (value >= 3) return "Moderate";
  return "Low";
}
