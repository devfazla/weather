import { Link } from "react-router-dom";
import { usePageMeta } from "../lib/seo";

/**
 * The in-app twin of public/404.html. The static file answers an unmatched path
 * at the edge with a real 404 status, this one covers a bad path that reaches
 * the bundle, which is what the dev and preview servers hand back for anything
 * that is not / or /contact. Same words on purpose, so neither version reads
 * like a different site.
 */
const META = {
  title: "Page not found — Weather by devFazla",
  description:
    "That address isn't part of the weather dashboard. The forecast and the contact form are one click away.",
  // Nothing here is worth indexing, so the canonical simply points back at the
  // one page that is.
  canonical: "https://weather.devfazla.com/",
  robots: "noindex, follow",
};

export default function NotFoundPage() {
  usePageMeta(META);

  return (
    <div className="grid min-h-dvh place-items-center px-5 py-8">
      <div className="w-full max-w-[460px]">
        <p className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          404
        </p>
        <h1 className="mt-3.5 text-balance font-heading text-[clamp(30px,7vw,42px)] font-extrabold leading-[1.15] tracking-[-0.025em]">
          That page isn't here
        </h1>
        <p className="mt-3.5 text-[15px] leading-[1.6] text-muted-foreground">
          The forecast lives at one address, and it takes any city you search for.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex items-center rounded-md bg-ink-soft px-5 py-3 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-primary"
        >
          Back to the forecast
        </Link>
      </div>
    </div>
  );
}
