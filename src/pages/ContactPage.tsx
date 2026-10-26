import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { contactMeta } from "../data/contactMeta";
import { sendContact } from "../lib/api";
import { CONTACT_EMAIL, isEmail, mailtoLink } from "../lib/contact";
import { show } from "../lib/snackbar";
import { usePageMeta } from "../lib/seo";
import { useTheme } from "../lib/theme";
import { fieldClass as field, hintClass as hint, labelClass as label } from "../lib/ui";
import {
  IconArrowLeft,
  IconArrowUpRight,
  IconCalendar,
  IconChat,
  IconGithub,
  IconLinkedin,
  IconMail,
  IconMoon,
  IconPin,
  IconSend,
  IconSunLine,
  IconTelegram,
  IconX,
} from "../components/icons";

type Errors = { email?: string; message?: string };

const META = {
  ...contactMeta,
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

/** Sentence openers, so the first word is the hardest one already written. */
const starters = [
  { label: "Wrong city", text: "The reading for " },
  { label: "A bug", text: "Something broke: " },
  { label: "An idea", text: "It would help if " },
  { label: "Say hi", text: "Just saying hello." },
];

const helps = [
  { Glyph: IconPin, text: "City", note: "the name you searched" },
  { Glyph: IconCalendar, text: "When", note: "the hour it looked wrong" },
  { Glyph: IconChat, text: "What", note: "the number you saw" },
];

/**
 * One handle everywhere, so only the marks need to be on screen. Every profile
 * is github/x/linkedin/telegram plus the same name.
 */
const socials = [
  { name: "GitHub", Glyph: IconGithub, href: "https://github.com/devfazla" },
  { name: "X", Glyph: IconX, href: "https://x.com/devfazla" },
  { name: "LinkedIn", Glyph: IconLinkedin, href: "https://www.linkedin.com/in/devfazla" },
  { name: "Telegram", Glyph: IconTelegram, href: "https://t.me/devfazla" },
];

export default function ContactPage() {
  const { dark, toggle } = useTheme();
  usePageMeta(META);

  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  const start = (text: string) => {
    setMessage((current) => (current.trim() ? `${current.trim()} ${text}` : text));
    messageRef.current?.focus();
  };

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

  // The draft in the side panel carries whatever has been typed so far, so
  // switching to the mail app is a continuation rather than a restart.
  const draftHref = mailtoLink(
    "Weather dashboard message",
    [message, "", name, email && `Reply to: ${email}`].filter(Boolean).join("\n"),
  );

  return (
    <div className="relative flex min-h-dvh flex-col px-4 pt-6 pb-6 md:px-6 md:pt-8">
      {/* Sky off the top edge, so the page is not one flat colour behind the card. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(78%_100%_at_50%_-45%,rgba(169,213,236,0.6),transparent_72%)] dark:bg-[radial-gradient(78%_100%_at_50%_-45%,rgba(38,73,92,0.75),transparent_72%)]"
      />

      <div className="relative mx-auto flex w-full max-w-[760px] flex-1 flex-col lg:max-w-[1060px]">
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

        {/* Auto margins centre the work on a tall screen and collapse to nothing
            once it needs to scroll, so the form is never clipped at the top. */}
        <main className="my-auto grid grid-cols-1 gap-4 pt-6 lg:grid-cols-12 lg:pt-8">
          <section
            className="animate-rise rounded-lg bg-card p-6 shadow-card sm:p-8 lg:col-span-7"
            style={{ animationDelay: "40ms" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Contact
            </p>
            <h1 className="mt-2.5 text-balance font-heading text-[30px] font-extrabold leading-[1.12] tracking-[-0.03em] text-foreground sm:text-[36px]">
              What should change?
            </h1>
            <p className="mt-2.5 max-w-[46ch] text-[14px] leading-[1.6] text-muted-foreground">
              A wrong city, a feature you want, a bug you hit. It lands in the devFazla inbox and
              the reply goes to the address you leave.
            </p>

            <form onSubmit={submit} noValidate className="mt-7 flex flex-col gap-4">
              {/* Two short fields, side by side as soon as each one still has
                  room for a real address without the label getting squeezed. */}
              <div className="grid items-start gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className={label}>
                    Name <span className="font-normal text-muted-foreground/80">(optional)</span>
                  </label>
                  <input
                    id="contact-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="given-name"
                    maxLength={80}
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
              </div>

              <div className="mt-1">
                <span className={label}>Start with</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {starters.map((starter) => (
                    <button
                      key={starter.label}
                      type="button"
                      onClick={() => start(starter.text)}
                      className="rounded-full bg-card-soft px-3.5 py-2 text-[12px] font-medium text-foreground ring-1 ring-inset ring-border transition-colors duration-200 hover:bg-secondary hover:ring-secondary-foreground/30 active:scale-[0.98]"
                    >
                      {starter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className={label}>
                  Message
                </label>
                <textarea
                  id="contact-message"
                  ref={messageRef}
                  required
                  rows={4}
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    if (errors.message) setErrors(({ message: _message, ...rest }) => rest);
                  }}
                  placeholder="Tell me the details"
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

              <button
                type="submit"
                disabled={state === "sending"}
                className="mt-2 grid h-12 w-full place-items-center rounded-md bg-ink-soft text-[14px] font-semibold text-white transition-[transform,opacity] duration-200 hover:scale-[1.01] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-55 disabled:hover:scale-100"
              >
                <span className="inline-flex items-center gap-2">
                  <IconSend className="size-[15px]" />
                  {state === "sending" ? "Sending…" : state === "sent" ? "Send another" : "Send message"}
                </span>
              </button>

              <p className="text-center text-[11px] leading-[1.5] text-muted-foreground">
                No account, no mailing list.
              </p>
            </form>
          </section>

          {/* Held to the top of its own grid area, the rail has the rest of the
              row to travel through: it stays put while a long form scrolls past
              and releases at the bottom of the column, after which the whole page
              moves together. self-start is what gives it that travel. */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-6 lg:col-span-5 lg:self-start">
            <section
              className="animate-rise relative overflow-hidden rounded-lg bg-ink-soft p-7 text-white sm:p-8"
              style={{ animationDelay: "110ms" }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-28 h-60 bg-[radial-gradient(120%_90%_at_50%_-30%,rgba(240,166,60,0.14),transparent_68%)]"
              />
              <span className="relative grid size-11 shrink-0 place-items-center rounded-md bg-white/10 ring-1 ring-inset ring-white/15">
                <IconMail className="size-5" />
              </span>
              <h2 className="relative mt-6 text-balance font-heading text-[23px] font-bold leading-[1.24] tracking-[-0.02em] sm:text-[25px]">
                Other ways to reach me
              </h2>
              <a
                href={draftHref}
                className="relative mt-2.5 inline-flex items-center gap-1.5 text-[15px] font-semibold underline decoration-sun/70 underline-offset-4 transition-colors duration-200 hover:decoration-sun focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun"
              >
                {CONTACT_EMAIL}
                <IconArrowUpRight className="size-4" />
              </a>
              <p className="relative mt-3.5 text-[13px] leading-[1.5] text-white/60">
                The draft opens with what you have typed.
              </p>

              {/* Marks only. Each one is the same name, so saying it four times
                  would be four lines of nothing. */}
              <ul className="relative mt-7 flex flex-wrap gap-2.5 border-t border-white/10 pt-6">
                {socials.map(({ name, Glyph, href }) => (
                  <li key={name}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${name}: devfazla`}
                      className="grid size-10 place-items-center rounded-md bg-white/10 text-white ring-1 ring-inset ring-white/15 transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun"
                    >
                      <Glyph className="size-[15px]" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <section
              className="animate-rise overflow-hidden rounded-lg bg-card shadow-card"
              style={{ animationDelay: "170ms" }}
            >
              <h2 className="px-5 pb-3.5 pt-5 text-[12px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
                Helps me fix it faster
              </h2>
              <ul className="divide-y divide-border border-t border-border">
                {helps.map(({ Glyph, text, note }) => (
                  <li key={text} className="flex items-center gap-3 px-5 py-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-secondary text-secondary-foreground">
                      <Glyph className="size-[17px]" />
                    </span>
                    <span className="min-w-0 text-[13px] leading-[1.45]">
                      <span className="font-semibold text-foreground">{text}</span>{" "}
                      <span className="text-muted-foreground">&middot; {note}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </main>

        <p className="mt-6 pb-2 text-center text-[12px] text-muted-foreground">
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
      </div>
    </div>
  );
}
