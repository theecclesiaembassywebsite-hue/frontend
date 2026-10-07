// Bot-defence data attached to public form submissions.
//
// Why a module-level store instead of threading props through every form: the
// guarded endpoints are all funnelled through fetchAPI, which merges these
// fields into the JSON body. A form only has to render <FormGuardFields />;
// it cannot forget to send them.
//
// What is sent (the backend's FormGuard reads and strips these):
//   website        honeypot, a hidden input a human never fills
//   formStartedAt  when the form appeared, so an instant POST is refused
//   captchaToken   Cloudflare Turnstile result (only when a site key is set)

// The site key is public by design (it ships in the page), so it is safe to
// default here; NEXT_PUBLIC_TURNSTILE_SITE_KEY overrides it per environment.
// The widget must list every hostname the site is served from.
export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAFPjanZUcIWl1qYb";

// Must match TURNSTILE_ACTION on the backend, which refuses tokens from any
// other action.
export const TURNSTILE_ACTION = "public-form";

// Endpoints whose backend route is behind FormGuard.
const GUARDED_POST =
  /^\/(prayer-requests|contact|first-timer|first-timer\/new-convert|events\/[^/]+\/register(-and-pay)?|training\/[^/]+\/enroll|cith\/ehub\/register|auth\/(register|forgot-password|resend-verification))$/;

type Registration = {
  startedAt: number;
  honeypot: HTMLInputElement | null;
  token: string | null;
  // Set when the widget could not run (script blocked, domain not registered).
  // The form is then sent without a token and the server decides.
  failed?: boolean;
  resetWidget: () => void;
};

let current: Registration | null = null;

export function registerFormGuard(reg: Registration) {
  current = reg;
  return () => {
    if (current === reg) current = null;
  };
}

export function isGuardedRequest(endpoint: string, method: string): boolean {
  return method === "POST" && GUARDED_POST.test(endpoint.split("?")[0]);
}

export class FormGuardPendingError extends Error {
  constructor() {
    super("Please wait a moment for the security check to finish, then try again.");
  }
}

/**
 * Returns the JSON body with the bot-defence fields merged in, or the body
 * unchanged when no <FormGuardFields /> is mounted. Throws if a captcha is
 * configured but has not produced a token yet.
 */
export function withFormGuard(body: BodyInit | null | undefined) {
  if (!current || typeof body !== "string") return body;
  if (TURNSTILE_SITE_KEY && !current.token && !current.failed) {
    throw new FormGuardPendingError();
  }
  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    return JSON.stringify({
      ...parsed,
      website: current.honeypot?.value ?? "",
      formStartedAt: current.startedAt,
      ...(current.token ? { captchaToken: current.token } : {}),
    });
  } catch {
    return body;
  }
}

/** A Turnstile token is single-use, and the fill timer restarts, after every attempt. */
export function resetFormGuard() {
  if (!current) return;
  current.token = null;
  current.failed = false;
  current.startedAt = Date.now();
  current.resetWidget();
}
