import type { BrowserOptions } from "@sentry/nextjs";

import { scrub, scrubHeaders, scrubUrl } from "./scrub";

/**
 * The one place the frontend decides whether Sentry runs and what it is allowed
 * to send. Both the client bundle (`src/instrumentation-client.ts`) and the
 * server/edge runtimes (`src/instrumentation.ts`) build their `Sentry.init`
 * call from here so the two cannot drift apart.
 *
 * With no DSN the SDK is never started and every Sentry call becomes a no-op,
 * so dev, CI and any self-hosted deploy run unchanged and nothing leaves the
 * box. This matches the backend's `initSentry()` contract exactly.
 */

// The browser can only read NEXT_PUBLIC_*. The server prefers a private
// SENTRY_DSN when one is set, so a deployment can report server errors without
// also shipping the DSN to every visitor.
export const CLIENT_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
export const SERVER_DSN = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

function sampleRate(raw: string | undefined, fallback: number): number {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
}

/**
 * Options shared by every runtime.
 *
 * `sendDefaultPii: false` turns OFF the SDK's automatic collection of IPs,
 * cookies and request bodies; `beforeSend` is then the last gate before the
 * network call and re-scrubs whatever did make it onto the event, rather than
 * trusting that every producer remembered to.
 */
export function baseSentryOptions(dsn: string): BrowserOptions {
  return {
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    // Vercel exposes the commit SHA, so an event points at the deploy that
    // produced it. Falls back to the generic name other platforms set.
    release:
      process.env.NEXT_PUBLIC_SENTRY_RELEASE ??
      process.env.VERCEL_GIT_COMMIT_SHA ??
      process.env.RELEASE_VERSION,

    tracesSampleRate: sampleRate(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE, 0.1),

    sendDefaultPii: false,

    // Session Replay is deliberately not enabled. It records the DOM of pages
    // that show member names, giving amounts and prayer requests, which is
    // exactly the data the scrubbing below exists to keep out of an event.
    // Turning it on is a privacy decision, not a config tweak.

    ignoreErrors: [
      // Browser/extension noise that is not actionable and would otherwise
      // dominate the issue list.
      "ResizeObserver loop completed with undelivered notifications",
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
      // A navigation away mid-fetch aborts in-flight requests; that is the user
      // leaving, not a fault.
      "AbortError",
      "The user aborted a request",
    ],

    beforeSend(event) {
      if (event.request) {
        event.request = {
          method: event.request.method,
          url: scrubUrl(event.request.url),
          headers: scrubHeaders(
            event.request.headers as Record<string, string | undefined> | undefined
          ),
          data: event.request.data ? scrub(event.request.data) : undefined,
          // Explicitly dropped: query_string and cookies are credential-bearing
          // on this app, and env can hold the whole secret set.
        };
      }

      if (event.user) {
        // Keep the id so an incident can be traced to an account; drop
        // everything that makes the event itself a member directory.
        event.user = { id: event.user.id };
      }

      if (event.extra) {
        event.extra = scrub(event.extra) as Record<string, unknown>;
      }

      return event;
    },

    beforeBreadcrumb(breadcrumb) {
      // HTTP breadcrumbs record outbound URLs — the Paystack verify call embeds
      // the payment reference in the path, and auth callbacks carry tokens in
      // the query string.
      if (breadcrumb.data?.url && typeof breadcrumb.data.url === "string") {
        breadcrumb.data.url = scrubUrl(breadcrumb.data.url);
      }
      if (breadcrumb.category === "console") {
        // Console output is the least controlled surface in the app.
        return null;
      }
      return breadcrumb;
    },
  };
}
