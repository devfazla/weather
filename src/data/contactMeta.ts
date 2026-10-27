/**
 * The contact page's head tags, in one place. The component feeds these to
 * `usePageMeta` once the app is up, and the build reads the same values to
 * write `contact.html`, so the HTML a crawler fetches and the head a browser
 * ends up with say the same thing.
 */
export const contactMeta = {
  title: "Contact · weather by devFazla",
  description:
    "Report a wrong city, suggest a feature or flag a bug. Messages go straight to the devFazla inbox, and the reply comes back to your address.",
  canonical: "https://weather.devfazla.com/contact",
};
