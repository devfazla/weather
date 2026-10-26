import { useSyncExternalStore } from "react";
import { getSnapshot, hide, subscribe } from "../lib/snackbar";
import { IconAlert, IconCheck, IconClose } from "./icons";

/**
 * The one place a form says "sent" or "failed". Mounted once above the routes so
 * a message survives the jump from the footer form to the contact page.
 */
export default function Snackbar() {
  const message = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  if (!message) return null;

  const bad = message.tone === "bad";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-6">
      <div
        key={message.id}
        id="snackbar"
        role={bad ? "alert" : "status"}
        className="animate-pop pointer-events-auto flex max-w-[480px] items-start gap-2.5 rounded-lg bg-ink-soft px-4 py-3 text-[13px] leading-[1.5] text-white shadow-card"
      >
        <span className="mt-[1px] shrink-0 opacity-90">
          {bad ? <IconAlert className="size-[15px]" /> : <IconCheck className="size-[15px]" />}
        </span>

        <span className="min-w-0">
          {message.text}
          {message.action && (
            <>
              {" "}
              <a
                href={message.action.href}
                className="font-semibold underline decoration-1 decoration-white/50 underline-offset-2 transition-colors duration-200 hover:decoration-white"
              >
                {message.action.label}
              </a>
            </>
          )}
        </span>

        <button
          type="button"
          onClick={hide}
          aria-label="Dismiss"
          className="-mr-1.5 mt-[1px] shrink-0 rounded-sm p-1 text-white/60 transition-colors duration-200 hover:text-white"
        >
          <IconClose className="size-[12px]" />
        </button>
      </div>
    </div>
  );
}
