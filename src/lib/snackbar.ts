/**
 * One message at a time, floating over the page. Both forms report their result
 * through here instead of leaving text inside the layout.
 */

export type Tone = "ok" | "bad";

export type SnackbarMessage = {
  id: number;
  text: string;
  tone: Tone;
  action?: { label: string; href: string };
};

let current: SnackbarMessage | null = null;
let counter = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

const listeners = new Set<() => void>();

const emit = (): void => listeners.forEach((notify) => notify());

function clearTimer(): void {
  if (timer !== undefined) clearTimeout(timer);
  timer = undefined;
}

export function show(
  text: string,
  tone: Tone = "ok",
  action?: { label: string; href: string },
): void {
  clearTimer();
  current = { id: (counter += 1), text, tone, action };
  // A failure with a link to follow deserves longer on screen than a nod.
  timer = setTimeout(hide, tone === "bad" ? 8000 : 4500);
  emit();
}

export function hide(): void {
  clearTimer();
  current = null;
  emit();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): SnackbarMessage | null {
  return current;
}
