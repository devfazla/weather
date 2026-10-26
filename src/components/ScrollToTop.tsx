import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * The footer links sit at the bottom of a long page, so a new route has to
 * start at the top. Left alone, the browser keeps the old scroll offset.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return null;
}
