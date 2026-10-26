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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Snackbar />
      <TrackPageviews />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
