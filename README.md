# Weather Dashboard

A single-page weather dashboard built with React, TypeScript and Tailwind CSS v4. It pulls live conditions, hourly and 7-day forecasts, air quality and UV data from [Open-Meteo](https://open-meteo.com/), places the visitor automatically on first load, and keeps the last snapshot on screen when the network fails.

| Desktop | Tablet |
| --- | --- |
| ![Sunny day in San Francisco](SunnyDaySanFrancisco.png) | ![Tablet layout](SunnyDayTablet.png) |

## Features

- **Live forecast** — current conditions, feels-like, sunrise/sunset and today's high/low.
- **Next 8 hours** — a scrollable strip with per-hour temps and WMO-mapped icons.
- **7-day outlook** — min/max range bars, with each day's high positioned inside the week's spread.
- **Highlights** — a written summary (rain timing, golden hour), US AQI, and a practical tip banner.
- **Metrics** — wind, humidity and UV index, each derived from the same response.
- **Location control** — search any city (debounced geocoding) or use the device's GPS position, resolved to a city name via reverse geocoding.
- **Automatic first placement** — new visitors are placed by IP, then their explicit choice is remembered.
- **Unit switch** — °C / °F without a refetch (the API is always queried in Celsius).
- **Light and dark themes** — token-driven, applied through a `dark` class on `<html>`.
- **Never empty** — a built-in sample snapshot paints the layout instantly and survives failed requests; the footer offers a retry.

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 19, function components and hooks only |
| Language | TypeScript 5.9 (`strict`, `noUnusedLocals`, `noEmit`) |
| Build | Vite 7 with `@vitejs/plugin-react` |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` (no `tailwind.config.js`) |
| Data | Open-Meteo forecast, air-quality and geocoding APIs |
| Storage | `localStorage` for the chosen place, IP placement and response cache |

No state manager, router, data-fetching library or UI kit — the app is a single view with a couple of hooks.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check (`tsc --noEmit`) then build to `dist/` |
| `npm run preview` | Serve the production build locally |

No `.env` file or API key is required: every upstream service is public and keyless. Because geolocation requires a secure context, the "My location" button only works over HTTPS or `localhost`.

## Architecture

```
src/
├── App.tsx                  # Layout, unit + theme state, dialog wiring
├── components/              # Presentational: Header, HeroCard, HourlyStrip,
│                            # WeekForecast, HighlightsCard, TipBanner,
│                            # MetricCard, LocationDialog, Footer, icons
├── data/weather.ts          # View-model types, default place, fallback snapshot
└── lib/
    ├── openMeteo.ts         # URL builders, WMO mapping, response -> Weather
    ├── useWeather.ts        # Active place + fetch lifecycle (loading/ready/error)
    ├── cache.ts             # localStorage cache with in-flight de-duplication
    ├── location.ts          # IP detection, saved place, reverse geocoding
    └── format.ts            # °C/°F, clock labels, weekday, UV buckets
```

The data flow is one-directional: `useWeather` owns the place and the current snapshot, all API translation happens in `openMeteo.ts`, and components receive a fully-formed `Weather` object. Nothing in `components/` knows about URLs, caching or error handling, which keeps the layout easy to restyle.

### Data pipeline

1. `useWeather` resolves a place — saved choice → IP lookup → `defaultPlace` (San Francisco).
2. `fetchWeather` requests `/v1/forecast` and `/v1/air-quality` in parallel; air quality is best-effort and degrades to "unavailable".
3. `buildWeather` collapses the response into the `Weather` view model: it locates "now" by string-matching wall-clock timestamps (the API returns the location's own timezone), maps WMO codes onto four glyphs, buckets UV and AQI, and generates the headline, tip and spotlight copy from those numbers.
4. The previous snapshot stays mounted while a new one loads, so the dashboard never flashes a skeleton.

### Caching

`cachedJson` wraps `localStorage` with per-product TTLs and a shared `Map` of in-flight requests:

| Request | TTL |
| --- | --- |
| Forecast | 10 minutes |
| Air quality | 30 minutes |
| Geocoding | 24 hours |
| IP placement (separate key) | 24 hours |

Coordinates are rounded to ~1 km before being used as a cache key, which matches the model grid and keeps reloads from burning the free tier's 10,000 calls/day. An aborted request rejects for that caller only — the shared fetch still completes and warms the cache. If a request fails, the expired entry is returned instead of an error.

## Design system

Tokens live in `src/index.css` and are exposed to Tailwind through `@theme inline`, so `bg-card`, `text-muted-foreground`, `rounded-xl` and friends all resolve to CSS variables. Adding a theme means editing the `:root` / `.dark` blocks, not class strings.

- **Palette** — soft sky background, white cards, `--primary` blue, `--sun` amber for warm accents.
- **Radii** — 10 / 16 / 22 / 32 px (`sm` / `md` / `lg` / `xl`).
- **Type** — Inter for UI, Nunito for the hero temperature.
- **Motion** — `animate-rise` staggers the cards in; `animate-pop` handles the location dialog.

## Responsive behaviour

- **Mobile** — single column, everything stacked.
- **Tablet (`md`)** — hero and strip full width, week list and side column split.
- **Desktop (`xl`)** — 12-column grid; metrics move into their own row so the week list keeps its width.

## Notes and limits

- Units toggle on the client; the WMO condition text and wind speed (km/h) are not unit-converted.
- The hero photo follows the weather, not the place: `src/lib/heroImage.ts` maps the WMO code, day/night and current temperature onto one of nine scenes (sunny, hot, partly cloudy, overcast, rain, storm, fog, snow, night). Bright scenes carry a heavier scrim so the note chip and credit stay readable.
- The scene photos live in `public/hero-*.jpg`, cropped to 4:3. Files under CC BY / CC BY-SA show a credit chip that links back to Wikimedia Commons; CC0 and public-domain files do not. `hero-sf.jpg` is also the fallback when an image fails to load.
- Air quality and IP placement are best-effort; failures degrade silently rather than blocking the dashboard.
- The project targets a modern browser (ES2022, `Google Fonts`, `localStorage`, `AbortController`).

Weather data by [Open-Meteo](https://open-meteo.com/) (CC BY 4.0). Reverse geocoding by [BigDataCloud](https://www.bigdatacloud.com/); IP placement by [ipwho.is](https://ipwho.is/) with [GeoJS](https://www.geojs.io/) as fallback.
