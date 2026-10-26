import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { sendContact } from "../lib/api";
import { CONTACT_EMAIL, isEmail, mailtoLink } from "../lib/contact";
import { show } from "../lib/snackbar";
import { usePageMeta } from "../lib/seo";
import { useTheme } from "../lib/theme";
import { fieldClass as field, hintClass as hint, labelClass as label } from "../lib/ui";
import { IconArrowLeft, IconMail, IconMoon, IconSend, IconSunLine } from "../components/icons";

type Errors = { email?: string; message?: string };

const META = {
  title: "Contact — weather by devFazla",
  description:
    "Report a wrong city, suggest a feature or flag a bug. Messages go straight to the devFazla inbox, and the reply comes back to your address.",
  canonical: "https://weather.devfazla.com/contact",
  schema: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": "https://weather.devfazla.com/contact#page",
        url: "https://weather.devfazla.com/contact",
        name: "Contact — weather by devFazla",
        description:
          "Report a wrong city, suggest a feature or flag a bug in the weather dashboard.",
        inLanguage: "en",
        isPartOf: { "@id": "https://weather.devfazla.com/#website" },
        publisher: { "@id": "https://weather.devfazla.com/#publisher" },
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://weather.devfazla.com/contact#breadcrumb",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Weather",
            item: "https://weather.devfazla.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Contact",
            item: "https://weather.devfazla.com/contact",
          },
        ],
      },
    ],
  },
};

export default function ContactPage() {
  const { dark, toggle } = useTheme();
  usePageMeta(META);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === "sending") return;

    const next: Errors = {};
    if (!isEmail(email)) next.email = "Add an address the reply can reach.";
    if (message.trim().length < 5) next.message = "A line or two is enough.";
    setErrors(next);

    if (Object.keys(next).length > 0) return;

    setState("sending");

    try {
      await sendContact({ name: name.trim(), email: email.trim(), message: message.trim() });
      setState("sent");
      setName("");
      setEmail("");
      setMessage("");
      show("Delivered. A reply comes to the address you left.", "ok");
    } catch {
      // A dead endpoint should not swallow the message: hand it to the mail app.
      const body = [
        message.trim(),
        "",
        name.trim() || "Sent from the weather dashboard",
        `Reply to: ${email.trim()}`,
      ].join("\n");

      setState("failed");
      show(`That did not go through. Write to ${CONTACT_EMAIL}, or`, "bad", {
        label: "open a mail draft",
        href: mailtoLink("Weather dashboard message", body),
      });
    }
  };

  return (
    <div className="min-h-dvh px-4 pt-6 pb-6 md:px-6 md:pt-8">
      <div className="mx-auto w-full max-w-[720px]">
        <header className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="group -m-1 flex min-w-0 items-center gap-3 rounded-full py-1 pl-1 pr-3 text-left transition-colors duration-200 hover:bg-card/60"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-foreground shadow-card transition-transform duration-200 group-hover:scale-105">
              <IconArrowLeft className="size-[18px]" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[18px] font-bold leading-tight tracking-[-0.01em] text-foreground">
                Weather
              </span>
              <span className="mt-[2px] block text-[12px] font-medium text-muted-foreground">
                Back to the forecast
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={toggle}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={dark}
            className="grid size-10 place-items-center rounded-full bg-card text-foreground shadow-card transition-transform duration-200 hover:scale-105"
          >
            {dark ? <IconSunLine className="size-[17px]" /> : <IconMoon className="size-[17px]" />}
          </button>
        </header>

        <main className="mt-5">
          <section className="animate-rise rounded-xl bg-card p-5 shadow-card sm:p-7">
            <span className="grid size-11 place-items-center rounded-full bg-secondary text-secondary-foreground">
              <IconMail className="size-[19px]" />
            </span>

            <h1 className="mt-4 text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-foreground">
              Contact
            </h1>
            <p className="mt-2 max-w-[56ch] text-[14px] leading-[1.6] text-muted-foreground">
              A wrong city, a feature you want, or a bug you hit: say it here. It lands in the
              devFazla inbox and the reply goes to the address you leave.
            </p>

            <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
              <div>
                <label htmlFor="contact-name" className={label}>
                  Name <span className="font-normal text-muted-foreground/80">(optional)</span>
                </label>
                <input
                  id="contact-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="given-name"
                  placeholder="Your name"
                  className={`${field} mt-1.5`}
                />
              </div>

              <div>
                <label htmlFor="contact-email" className={label}>
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (errors.email) setErrors(({ email: _email, ...rest }) => rest);
                  }}
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  className={`${field} mt-1.5`}
                />
                {errors.email && (
                  <p id="contact-email-error" className={`${hint} text-sun-ink`}>
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="contact-message" className={label}>
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    if (errors.message) setErrors(({ message: _message, ...rest }) => rest);
                  }}
                  placeholder="What should change?"
                  aria-invalid={errors.message ? true : undefined}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                  className={`${field} mt-1.5 resize-y`}
                />
                {errors.message && (
                  <p id="contact-message-error" className={`${hint} text-sun-ink`}>
                    {errors.message}
                  </p>
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="inline-flex items-center gap-2 rounded-full bg-ink-soft px-5 py-[11px] text-[14px] font-semibold text-white transition-transform duration-200 hover:scale-[1.03] disabled:opacity-55 disabled:hover:scale-100"
                >
                  <IconSend className="size-[15px]" />
                  {state === "sending" ? "Sending…" : "Send message"}
                </button>
                <p className="text-[12px] text-muted-foreground">No account, no mailing list.</p>
              </div>
            </form>
          </section>

          <p className="mt-4 pb-2 text-center text-[12px] text-muted-foreground">
            <Link
              to="/"
              className="font-medium underline decoration-1 underline-offset-2 decoration-muted-foreground/40 transition-colors duration-200 hover:text-foreground hover:decoration-current"
            >
              Weather
            </Link>{" "}
            · Built by{" "}
            <a
              href="https://devfazla.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline decoration-1 underline-offset-2 decoration-muted-foreground/40 transition-colors duration-200 hover:text-foreground hover:decoration-current"
            >
              devFazla
            </a>
          </p>
        </main>
      </div>
    </div>
  );
}
