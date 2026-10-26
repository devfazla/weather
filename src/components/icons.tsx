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

/* --------------------------------------------------------- brand glyphs */
/* The official marks, filled and set to currentColor. Brand blue and brand
   black would fight the theme, so they take whatever colour the row has. */

export function IconGithub({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor" {...rest}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export function IconX({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor" {...rest}>
      <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
    </svg>
  );
}

export function IconLinkedin({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor" {...rest}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function IconTelegram({ className = "size-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor" {...rest}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
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
