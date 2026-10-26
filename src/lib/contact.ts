/** Inbox behind the contact page and the newsletter form. */
export const CONTACT_EMAIL = "hello@devfazla.com";

/** Loose on purpose. The mail client is the final validator anyway. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isEmail = (value: string) => EMAIL.test(value.trim());

/**
 * A static build has no inbox of its own, so both forms hand the message to
 * the visitor's mail client. Swap this for a provider endpoint when the
 * newsletter grows up.
 */
export function mailtoLink(subject: string, body: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
