import { defineConfig, loadEnv, type Connect, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
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

export default defineConfig(({ mode }) => {
  // The functions read process.env, exactly as they will on Vercel.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    plugins: [react(), tailwindcss(), api()],
  };
});
