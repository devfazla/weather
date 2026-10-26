import { defineConfig, loadEnv, type Connect, type Plugin } from "vite";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { contactMeta } from "./src/data/contactMeta";
import contact from "./api/contact";
import report from "./api/report";
import stats from "./api/stats";
import subscribe from "./api/subscribe";
import track from "./api/track";
import type { ApiRequest, ApiResponse } from "./api/_shared";

type Handler = (req: ApiRequest, res: ApiResponse) => Promise<unknown>;

const routes: Record<string, Handler> = {
  "/api/contact": contact,
  "/api/subscribe": subscribe,
  "/api/track": track,
  "/api/report": report,
  "/api/stats": stats,
};

/**
 * Vercel turns /api into functions; nothing does locally. Mounting the same
 * handlers here keeps the forms and the beacon working under `npm run dev`
 * and `npm run preview`.
 */
function api(): Plugin {
  const attach = (server: { middlewares: Connect.Server }) => {
    const middleware: Connect.NextHandleFunction = (req, res, next) => {
      // Vite types the request from its own shim, which drops `url`.
      const path = (req as Connect.IncomingMessage & { url?: string }).url?.split("?")[0] ?? "";
      const handler = routes[path];

      if (!handler) return next();
      void handler(req as unknown as ApiRequest, res as unknown as ApiResponse).catch(next);
    };

    server.middlewares.use(middleware);
  };

  return {
    name: "api",
    configureServer: attach,
    configurePreviewServer: attach,
  };
}

/**
 * Vercel answers a path that matches no file with `public/404.html`, and it does
 * that before any rewrite is considered, so `/contact` can only be served by a
 * file named `contact.html`. The build copies the shell and swaps the
 * page-level tags from the same object the component hands to `usePageMeta`, so
 * the HTML a crawler fetches says what the browser head says a moment later.
 */
function contactRoute(): Plugin {
  let outDir = "";

  const withContactHead = (html: string) =>
    html
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${contactMeta.title}</title>`)
      .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${contactMeta.canonical}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${contactMeta.canonical}$2`)
      .replace(
        /(<meta\s+name="description"\s+content=")[^"]*(")/,
        `$1${contactMeta.description}$2`,
      )
      .replace(
        /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
        `$1${contactMeta.description}$2`,
      )
      .replace(
        /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
        `$1${contactMeta.description}$2`,
      )
      .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${contactMeta.title}$2`)
      .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${contactMeta.title}$2`);

  return {
    name: "contact-route",
    apply: "build",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const shell = readFileSync(resolve(outDir, "index.html"), "utf8");
      writeFileSync(resolve(outDir, "contact.html"), withContactHead(shell));
    },
  };
}

export default defineConfig(({ mode }) => {
  // The functions read process.env, exactly as they will on Vercel.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    plugins: [react(), tailwindcss(), api(), contactRoute()],
  };
});
