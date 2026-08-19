// Runs after the HTML document loads and before React hydration, which is early
// enough to catch errors thrown during hydration itself.
//
// Next only treats this file as client instrumentation at the project root or
// directly inside `src/` — moving it under `src/lib/` silently disables it.
import * as Sentry from "@sentry/nextjs";

import { CLIENT_DSN, baseSentryOptions } from "@/lib/observability/sentry-options";

if (CLIENT_DSN) {
  Sentry.init({
    ...baseSentryOptions(CLIENT_DSN),

    // Trace propagation has to name the origins the browser is allowed to send
    // the sentry-trace header to. Without this the header is attached to every
    // outbound request, including Paystack and YouTube.
    tracePropagationTargets: [
      /^\//,
      ...(process.env.NEXT_PUBLIC_API_URL ? [process.env.NEXT_PUBLIC_API_URL] : []),
    ],
  });
}

// Next calls this on every client-side navigation; Sentry uses it to open the
// navigation span. Exported unconditionally — it is a no-op when init never ran.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
