// Server-side instrumentation. `register()` runs once per server instance
// before the first request is handled, which is what lets the Node SDK patch
// http and friends before route handlers require them.
//
// The init is loaded with a dynamic import inside `register()` rather than a
// top-level import so the Node build is never pulled into the edge bundle and
// vice versa.
import * as Sentry from "@sentry/nextjs";

export async function register() {
  const { SERVER_DSN, baseSentryOptions } = await import(
    "@/lib/observability/sentry-options"
  );

  if (!SERVER_DSN) return;

  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init(baseSentryOptions(SERVER_DSN));
  }
}

// Next hands every server-side error here — Server Component renders, route
// handlers and Server Actions alike. `captureRequestError` reads the router
// kind and route path off `context` so the issue is grouped by route rather
// than by the one stack frame they all share.
export const onRequestError = Sentry.captureRequestError;
