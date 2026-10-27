import { Analytics } from "@vercel/analytics/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import Snackbar from "./components/Snackbar.tsx";
import TrackPageviews from "./components/TrackPageviews.tsx";
import { watchErrors } from "./lib/analytics";
import "./index.css";

watchErrors();

/**
 * Vercel's own visitor counts. Off their hosts the package reaches for a debug
 * script on another origin, which the page's policy blocks and the collector
 * would discard anyway, so the component is only mounted where it can work.
 */
const hosted = !["localhost", "127.0.0.1", ""].includes(window.location.hostname);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Snackbar />
      <TrackPageviews />
      {hosted && <Analytics />}
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
