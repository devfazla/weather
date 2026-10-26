import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ray = (angle: number, from: number, to: number) => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x1: +(12 + cos * from).toFixed(2),
    y1: +(12 + sin * from).toFixed(2),
    x2: +(12 + cos * to).toFixed(2),
    y2: +(12 + sin * to).toFixed(2),
  };
};

const rays8 = Array.from({ length: 8 }, (_, i) => ray((Math.PI / 4) * i, 7.4, 9.5));

/* ------------------------------------------------------------ UI glyphs */

export function IconPin({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <path d="M19.5 10.4c0 5.1-5.3 9.9-6.9 11.2a1 1 0 0 1-1.2 0C9.8 20.3 4.5 15.5 4.5 10.4a7.5 7.5 0 1 1 15 0Z" />
      <circle cx="12" cy="10.2" r="2.7" />
    </svg>
  );
}

export function IconSearch({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <circle cx="10.8" cy="10.8" r="6.4" />
      <path d="m19.5 19.5-3.6-3.6" />
    </svg>
  );
}

export function IconMoon({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <path d="M20.5 14.6A8.7 8.7 0 0 1 9.4 3.5a8.8 8.8 0 1 0 11.1 11.1Z" />
    </svg>
  );
}

export function IconSunLine({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <circle cx="12" cy="12" r="3.7" />
      {rays8.map((r, i) => (
        <line key={i} {...r} />
      ))}
    </svg>
  );
}

export function IconSunrise({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <path d="M12 3.2v6.4M9.2 6l2.8-2.8L14.8 6" />
      <path d="M8.4 18a3.6 3.6 0 0 1 7.2 0" />
      <path d="M2.8 18h2.2M19 18h2.2M4.9 12.4l1.6 1.6M19.1 12.4l-1.6 1.6M2.8 21h18.4" />
    </svg>
  );
}

export function IconSunset({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <path d="M12 9.6V3.2M9.2 6l2.8 2.8L14.8 6" />
      <path d="M8.4 18a3.6 3.6 0 0 1 7.2 0" />
      <path d="M2.8 18h2.2M19 18h2.2M4.9 12.4l1.6 1.6M19.1 12.4l-1.6 1.6M2.8 21h18.4" />
    </svg>
  );
}

export function IconArrowUpRight({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <path d="M7.5 16.5 16.5 7.5M8.6 7.5h7.9v7.9" />
    </svg>
  );
}

export function IconChevronDown({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <path d="m6.6 9.6 5.4 5.4 5.4-5.4" />
    </svg>
  );
}

export function IconClose({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <path d="m6.6 6.6 10.8 10.8M17.4 6.6 6.6 17.4" />
    </svg>
  );
}

export function IconCheck({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <circle cx="12" cy="12" r="8.8" />
      <path d="m8.1 12.3 2.7 2.7 5.1-5.5" />
    </svg>
  );
}

export function IconAlert({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 7.7v5.1M12 16.2h.01" />
    </svg>
  );
}

export function IconLocate({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <circle cx="12" cy="12" r="3.1" />
      <circle cx="12" cy="12" r="7.3" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2" />
    </svg>
  );
}

export function IconWind({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <path d="M12.9 18.4A1.9 1.9 0 1 0 14 15H3" />
      <path d="M17.2 8.6a2.4 2.4 0 1 1 1.9 3.9H3" />
      <path d="M10 5.6a1.9 1.9 0 1 1 1.1 3.4H3" />
    </svg>
  );
}

export function IconHumidity({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <path d="M12 3.4c2.6 3.3 5.4 6.2 5.4 9.4a5.4 5.4 0 0 1-10.8 0c0-3.2 2.8-6.1 5.4-9.4Z" />
    </svg>
  );
}

export function IconMail({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <rect x="3" y="5.4" width="18" height="13.2" rx="3" />
      <path d="m4.4 7.6 6.6 4.9a1.8 1.8 0 0 0 2 0l6.6-4.9" />
    </svg>
  );
}

export function IconUser({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <circle cx="12" cy="8.6" r="3.5" />
      <path d="M5.6 19.6a6.7 6.7 0 0 1 12.8 0" />
    </svg>
  );
}

export function IconSend({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <path d="M20.6 3.4 3.7 9.9a.5.5 0 0 0-.05.92l6.3 3.2 3.2 6.3a.5.5 0 0 0 .92-.05Z" />
      <path d="m9.95 14.05 5.1-5.1" />
    </svg>
  );
}

export function IconChevronRight({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <path d="m9.6 6.6 5.4 5.4-5.4 5.4" />
    </svg>
  );
}

export function IconChat({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <path d="M20.5 11.9c0 3.8-3.8 6.9-8.5 6.9-.9 0-1.8-.12-2.6-.34L4.6 20l1.3-3.7a6.5 6.5 0 0 1-2.4-4.4C3.5 8.1 7.3 5 12 5s8.5 3.1 8.5 6.9Z" />
      <path d="M8.9 11.9h.01M12 11.9h.01M15.1 11.9h.01" strokeWidth={2.4} />
    </svg>
  );
}

export function IconCalendar({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <rect x="3.4" y="5.2" width="17.2" height="15.4" rx="3" />
      <path d="M3.4 10h17.2M8.2 3.4v3.6M15.8 3.4v3.6" />
      <path d="M7.8 14.2h.01M12 14.2h.01M16.2 14.2h.01M7.8 17.4h.01M12 17.4h.01" strokeWidth={2.2} />
    </svg>
  );
}

export function IconArrowLeft({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <path d="M19.4 12H4.6m5.6-6.4L3.8 12l6.4 6.4" />
    </svg>
  );
}

/* -------------------------------------------------------- weather glyphs */

export function WeatherSun({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <circle cx="12" cy="12" r="3.5" />
      {rays8.map((r, i) => (
        <line key={i} {...r} />
      ))}
    </svg>
  );
}

export function WeatherPartly({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <path d="M9.6 5.9a4.1 4.1 0 0 0-4 3.2" />
      <path d="M13.6 2.6v1.9M5.1 5.1l1.4 1.4M2.45 13.5l1.9-.6M4.4 8.5 6 9.6" />
      <path d="M12.65 18.4a3.6 3.6 0 0 0 3.2-5.2 4.9 4.9 0 0 0-9-.2 3.5 3.5 0 0 0 .9 5.4Z" />
      <path d="M9 21.4h10.2a3.6 3.6 0 0 0 .6-7.1 5.2 5.2 0 0 0-9.5-.6" />
    </svg>
  );
}

export function WeatherCloud({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <path d="M17.3 18.6H9.4a6.6 6.6 0 1 1 6.3-8.5h1.6a4.3 4.3 0 0 1 0 8.5Z" />
    </svg>
  );
}

export function WeatherSunLow({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...line} {...rest}>
      <circle cx="12" cy="10.6" r="3.1" />
      <path d="M12 3.1v2.1M5.6 5.9l1.5 1.5M18.4 5.9l-1.5 1.5M3.4 10.6h2.1M18.5 10.6h2.1" />
      <path d="M3.4 17.2h17.2M6 20.4h12" />
    </svg>
  );
}
