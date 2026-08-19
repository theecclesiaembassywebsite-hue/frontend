/**
 * Redaction for anything on its way off the device or the server — a Sentry
 * event, a breadcrumb, an error report.
 *
 * This is the browser/edge-safe twin of the backend's
 * `src/common/observability/scrub.ts`. Keep the two in step: an event shape
 * that is unsafe to send from the API is unsafe to send from the app. The only
 * deliberate difference is that this one has no `Buffer` branch, because
 * neither the browser nor the edge runtime has it.
 */

// Matched against a key, case-insensitively, as a substring — so `password`
// also catches `newPassword`, `passwordHash` and `password_confirmation`.
const SENSITIVE_KEY_PATTERNS = [
  "password",
  "passwd",
  "secret",
  "token",
  "authorization",
  "cookie",
  "apikey",
  "api_key",
  "signature",
  "credential",
  "creditcard",
  "card_number",
  "cardnumber",
  "cvv",
  "pin",
  "ssn",
  "otp",
  // Direct identifiers of a person. A report needs to say *that* the giving
  // flow broke, not who was giving.
  "email",
  "phone",
  "address",
  "dateofbirth",
  "dob",
];

export const REDACTED = "[redacted]";

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_KEY_PATTERNS.some((pattern) => lower.includes(pattern));
}

/**
 * Values that look like a credential regardless of what they're called —
 * the case the key-name list can't catch.
 */
function looksLikeSecret(value: string): boolean {
  return (
    // JWTs — three base64url segments.
    /^ey[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]*$/.test(value) ||
    // Paystack/Stripe-style keys.
    /\b(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{8,}\b/.test(value) ||
    // Bearer headers pasted into a field.
    /^Bearer\s+\S+/i.test(value) ||
    // A connection URL with inline credentials.
    /^[a-z][a-z0-9+.-]*:\/\/[^:@/\s]+:[^@/\s]+@/i.test(value)
  );
}

/**
 * Returns a redacted deep copy. Never mutates the input.
 *
 * `depth` bounds recursion so a deeply nested or self-referential payload can't
 * turn error reporting into the thing that breaks the page.
 */
export function scrub(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[truncated]";
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    if (looksLikeSecret(value)) return REDACTED;
    return value.length > 2048 ? `${value.slice(0, 2048)}…[truncated]` : value;
  }

  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => scrub(item, depth + 1));
  }

  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      out[key] = isSensitiveKey(key) ? REDACTED : scrub(item, depth + 1);
    }
    return out;
  }

  return `[${typeof value}]`;
}

/**
 * Headers minus the ones that carry credentials. Allowlisted rather than
 * denylisted, so a credential-bearing header added later defaults to dropped.
 */
const REPORTABLE_HEADERS = [
  "user-agent",
  "referer",
  "content-type",
  "content-length",
  "accept",
  "accept-language",
  "origin",
  "x-request-id",
];

export function scrubHeaders(
  headers: Record<string, string | string[] | undefined> | undefined
): Record<string, string> {
  if (!headers) return {};
  const out: Record<string, string> = {};
  for (const name of REPORTABLE_HEADERS) {
    const raw = headers[name];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (typeof value === "string") {
      out[name] = value.length > 512 ? `${value.slice(0, 512)}…` : value;
    }
  }
  return out;
}

/**
 * Strips a URL down to its path.
 *
 * Query strings across this app carry email-verification tokens, password-reset
 * tokens and payment references, so the whole string is treated as sensitive
 * rather than picked over parameter by parameter.
 */
export function scrubUrl(url: string | undefined): string {
  if (!url) return "";
  const [path, query] = url.split("?");
  return query ? `${path}?[redacted]` : path;
}
