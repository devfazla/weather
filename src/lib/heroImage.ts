/**
 * The hero photo for the sky outside right now. One photo per scene the
 * forecast can produce, so the card always matches what the user sees.
 */
export type HeroScene = {
  src: string;
  /** What the photo shows — the only thing a screen reader gets. */
  alt: string;
  /** Attribution, set only for the CC BY / CC BY-SA files. */
  credit: string | null;
  /** Commons file page the credit links back to. */
  source: string | null;
  /** Deepens the gradients for bright photos (sun, sand, snow, fog). */
  scrim: "soft" | "strong";
};

type SceneId = "sunny" | "hot" | "partly" | "cloudy" | "rain" | "storm" | "fog" | "snow" | "night";

const HEROES: Record<SceneId, HeroScene> = {
  sunny: {
    // The original mockup shot: doubles as the sunny scene and the last resort.
    src: "/hero-sf.jpg",
    alt: "Clear blue sky over a waterfront skyline in bright morning sun",
    credit: null,
    source: null,
    scrim: "soft",
  },
  hot: {
    src: "/hero-hot.jpg",
    alt: "A desert dune under a blazing white sun and a bleached sky",
    credit: null,
    source: null,
    scrim: "strong",
  },
  partly: {
    src: "/hero-partly.jpg",
    alt: "Scattered fair-weather clouds drifting over an open meadow",
    credit: "kosun · CC BY-SA 3.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Ukraine,_Krym,_Kirovske_-_Krasnoyarskoye-Krasnoiarske_WMID7884483.jpg",
    scrim: "strong",
  },
  cloudy: {
    src: "/hero-cloudy.jpg",
    alt: "A grey overcast ceiling hanging over snowy peaks and wet grass",
    credit: "Dietmar Rabich · CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Banff_National_Park_(AB,_Canada),_Bankhead,_Lower_Bankhead,_Blick_auf_Mt_Astley_--_2022_--_2217.jpg",
    scrim: "strong",
  },
  rain: {
    src: "/hero-rain.jpg",
    alt: "Rain running in long streaks down a window over a treeline",
    credit: null,
    source: null,
    scrim: "soft",
  },
  storm: {
    src: "/hero-storm.jpg",
    alt: "Lightning branching into the sea beside a jetty at night",
    credit: "Maxime Raynal · CC BY 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Port_and_lighthouse_overnight_storm_with_lightning_in_Port-la-Nouvelle.jpg",
    scrim: "soft",
  },
  fog: {
    src: "/hero-fog.jpg",
    alt: "Tall pines fading into thick white mist",
    credit: null,
    source: null,
    scrim: "strong",
  },
  snow: {
    src: "/hero-snow.jpg",
    alt: "A snowy riverbank and village under a low winter sun",
    credit: "Nenad Stojkovic · CC BY 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:River_in_a_small_village_with_the_forest_on_the_other_side_covered_in_snow_(49363041327).jpg",
    scrim: "strong",
  },
  night: {
    src: "/hero-night.jpg",
    alt: "A full moon over a still alpine lake after dark",
    credit: null,
    source: null,
    scrim: "soft",
  },
};

export type HeroInput = {
  /** WMO 4677 code of the current conditions. */
  code: number;
  /** True while the sun is up, per Open-Meteo's `is_day`. */
  isDay: boolean;
  /** Current temperature in °C, used to split clear skies into hot vs mild. */
  tempC: number;
};

/** Above this a clear sky reads as glare rather than a pleasant day. */
const HOT_C = 27;

const FOG = new Set([45, 48]);
const SNOW = new Set([71, 73, 75, 77, 85, 86]);

const isRain = (code: number) => (code >= 51 && code <= 67) || (code >= 80 && code <= 82);

function sceneFor({ code, isDay, tempC }: HeroInput): SceneId {
  // Precipitation wins over darkness: the rain photo beats the moon at night.
  if (code >= 95) return "storm";
  if (SNOW.has(code)) return "snow";
  if (isRain(code)) return "rain";
  if (FOG.has(code)) return "fog";

  // After dark nothing above is bright, so clear through overcast share one sky.
  if (!isDay) return "night";

  if (code === 3) return "cloudy";
  if (code === 2) return "partly";
  return tempC >= HOT_C ? "hot" : "sunny";
}

export function resolveHero(input: HeroInput): HeroScene {
  return HEROES[sceneFor(input)];
}

/** Clear skies double as the "nothing matched" and "image failed" scene. */
export const fallbackHero = HEROES.sunny;
