import { useEffect, useState } from "react";

const KEY = "weather.theme.v1";

/**
 * Light/dark for the whole document, shared by the dashboard and the contact
 * page and remembered between them. The class on <html> is what the tokens in
 * index.css key off.
 */
export function useTheme() {
  const [dark, setDark] = useState(() => {
    try {
      return window.localStorage.getItem(KEY) === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";

    try {
      window.localStorage.setItem(KEY, dark ? "dark" : "light");
    } catch {
      // Private mode. The class still applies for this visit.
    }
  }, [dark]);

  return { dark, toggle: () => setDark((value) => !value) };
}
