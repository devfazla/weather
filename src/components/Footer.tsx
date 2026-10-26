import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import type { WeatherStatus } from "../lib/useWeather";
import { sendNewsletter } from "../lib/api";
import { isEmail } from "../lib/contact";
import { show } from "../lib/snackbar";
import { IconChat, IconChevronRight, IconMail, IconUser } from "./icons";

type Props = {
  status: WeatherStatus;
  onRetry: () => void;
};

const tile =
  "grid size-11 shrink-0 place-items-center rounded-md bg-white/10 text-white ring-1 ring-inset ring-white/15";

const heading = "font-heading text-[17px] font-bold leading-tight tracking-[-0.015em] text-white";

const copy = "mt-1.5 text-[13px] leading-[1.5] text-white/65";

const signupField =
  "w-full rounded-md bg-input py-3.5 pl-11 pr-4 text-[14px] leading-tight text-foreground ring-1 ring-inset ring-border outline-none transition-shadow duration-200 placeholder:text-muted-foreground/80 focus:ring-2 focus:ring-primary/45";

export default function Footer({ status, onRetry }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  const subscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === "sending") return;

    if (!isEmail(email)) {
      setInvalid(true);
      show("Email needed", "bad");
      return;
    }

    setInvalid(false);
    setState("sending");

    try {
      await sendNewsletter({
        email: email.trim(),
        name: name.trim() || undefined,
        source: "footer",
      });
      setState("sent");
      setName("");
      setEmail("");
      show("You are on the list", "ok");
    } catch {
      setState("failed");
      show("Could not send. Try again.", "bad");
    }
  };

  return (
    <footer className="mt-6">
      {/* One under the other, each taking the full width of the page. */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col rounded-lg bg-ink-soft p-6 text-white shadow-card">
          <div className="flex gap-4">
            <span className={tile}>
              <IconChat className="size-[19px]" />
            </span>
            <div className="min-w-0">
              <h2 className={heading}>Have a question?</h2>
              <p className={copy}>
                I&rsquo;m happy to help. Get in touch if you need anything or just want to say hi.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <Link
              to="/contact"
              className="grid h-11 w-fit items-center rounded-full px-5 text-[13px] font-semibold text-white ring-1 ring-inset ring-white/25 transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun"
            >
              Contact me
            </Link>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-lg bg-card-soft px-6 py-10 shadow-card sm:px-10 sm:py-14 xl:px-12 xl:py-20">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden overflow-hidden rounded-lg sm:block"
          >
            {/* Pale corner washes, the lower one edged by a hairline curve. */}
            <svg viewBox="0 0 1440 460" preserveAspectRatio="none" className="size-full">
              <path d="M1150 0c74 92 180 134 290 146V0Z" className="fill-primary/10" />
              <path d="M0 460V366c124 16 218 50 288 94Z" className="fill-primary/10" />
              <path
                d="M0 350c130 17 228 56 298 110"
                className="fill-none stroke-primary/40"
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </span>

          {/* Stacked the band reads as one centred column; from xl the copy and the card split. */}
          <div className="relative mx-auto grid w-full max-w-[420px] items-center gap-8 xl:max-w-none xl:grid-cols-[minmax(0,1fr)_minmax(0,400px)] xl:gap-14">
            <div className="xl:max-w-[480px]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Free newsletter
              </p>
              <h2 className="mt-3 text-balance font-heading text-[26px] font-extrabold leading-[1.14] tracking-[-0.028em] text-foreground sm:text-[34px] sm:leading-[1.12]">
                Weather updates and
                <span className="block text-primary">useful tips</span>
              </h2>
              <p className="mt-3.5 text-pretty text-[14px] leading-[1.6] text-muted-foreground">
                An email and an optional name. Nothing else to fill in.
              </p>
            </div>

            {/* The fields live in their own card, so they keep a readable width on a wide band. */}
            <form
              onSubmit={subscribe}
              noValidate
              className="flex w-full flex-col gap-3 rounded-lg bg-card p-5 shadow-card ring-1 ring-border/70 sm:p-7"
            >
              <div className="relative">
                <label htmlFor="newsletter-name" className="sr-only">
                  Name
                </label>
                <IconUser className="pointer-events-none absolute left-4 top-1/2 size-[17px] -translate-y-1/2 text-muted-foreground/80" />
                <input
                  id="newsletter-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="given-name"
                  maxLength={80}
                  placeholder="Your name"
                  className={signupField}
                />
              </div>

              <div className="relative">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email
                </label>
                <IconMail className="pointer-events-none absolute left-4 top-1/2 size-[17px] -translate-y-1/2 text-muted-foreground/80" />
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (invalid) setInvalid(false);
                  }}
                  autoComplete="email"
                  placeholder="Email address"
                  aria-invalid={invalid ? true : undefined}
                  className={signupField}
                />
              </div>

              <button
                type="submit"
                disabled={state === "sending"}
                className="grid h-12 w-full place-items-center rounded-md bg-ink-soft text-[14px] font-semibold text-white transition-[transform,opacity] duration-200 hover:scale-[1.01] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-55 disabled:hover:scale-100"
              >
                <span className="inline-flex items-center gap-2">
                  Subscribe
                  <IconChevronRight className="size-[15px]" />
                </span>
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* Credit sits under the panels, not inside them. */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 px-1">
        <p className="font-heading text-[13px] font-bold leading-tight text-foreground">
          Fazla Rabbi
        </p>
        <span aria-hidden className="text-[12px] text-muted-foreground/70">
          ·
        </span>
        <a
          href="https://devfazla.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm text-[12px] text-muted-foreground underline decoration-1 underline-offset-[3px] decoration-muted-foreground/40 transition-colors duration-200 hover:text-foreground hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun"
        >
          devfazla.com
        </a>

        {/* Only shows when the forecast call failed; the retry has to live somewhere. */}
        {status === "error" && (
          <button
            type="button"
            onClick={onRetry}
            data-retry
            className="ml-1 inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-[11px] font-medium text-foreground shadow-card transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            Try again
            <IconChevronRight className="size-[11px]" />
          </button>
        )}
      </div>
    </footer>
  );
}
