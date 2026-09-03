import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

const isProd = process.env.NODE_ENV === "production";

const apiOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
})();

// The browser SDK POSTs events to the DSN's own host
// (https://<org>.ingest.<region>.sentry.io), which `connect-src 'self'` refuses.
// Derived from the DSN rather than hard-coded so the policy stays correct when
// the project moves org or region, and stays absent entirely when Sentry is off.
const sentryIngestOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
})();

// The live page opens a socket.io connection to the API with
// `transports: ["websocket"]` (src/app/live/page.tsx), and a ws:// or wss://
// URL is not covered by the matching http(s) source — a browser check against
// the built app blocked it four times over on /live before this was added.
const apiWebSocketOrigin = apiOrigin
  ? apiOrigin.replace(/^http/, "ws")
  : null;

// Verified against the built app in a real browser across 20 routes, not
// written from a template. Two things that audit found are worth stating,
// because both look like bugs and neither is:
//
//  1. A bundled library probes for eval with `try { Function("") } catch {}`
//     and caches the answer. Under this policy the probe is refused, the
//     library takes its non-eval path, and no error reaches the page. It does
//     report a `script-src` violation, which is the browser working correctly.
//     Do not add 'unsafe-eval' to silence it — that would re-open the exact
//     hole this policy exists to close, in order to satisfy a feature test
//     that is already handling the "no" answer.
//
//  2. 'unsafe-inline' in script-src is load-bearing for Next's hydration
//     bootstrap and cannot simply be dropped. It does weaken the XSS story,
//     so this policy earns its keep elsewhere: object-src 'none', base-uri
//     'self', frame-ancestors 'none', and an explicit origin allowlist that
//     stops an injected script from reaching an attacker's host. Moving to
//     nonces is the real upgrade, and needs middleware.
const csp = [
  "default-src 'self'",
  [
    "script-src",
    "'self'",
    "'unsafe-inline'",
    ...(isProd ? [] : ["'unsafe-eval'"]),
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com",
    "https://open.spotify.com",
    "https://js.paystack.co",
    "https://checkout.paystack.com",
    "https://www.paypal.com",
    "https://www.sandbox.paypal.com",
    "https://vercel.live",
    "https://va.vercel-scripts.com",
  ].join(" "),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  [
    "connect-src",
    "'self'",
    apiOrigin,
    apiWebSocketOrigin,
    "https://api.theecclesiaembassy.org",
    "wss://api.theecclesiaembassy.org",
    "https://www.googleapis.com",
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com",
    "https://i.ytimg.com",
    "https://open.spotify.com",
    "https://api.spotify.com",
    "https://checkout.paystack.com",
    "https://api.paystack.co",
    "https://www.paypal.com",
    "https://www.sandbox.paypal.com",
    "https://vitals.vercel-insights.com",
    "https://vercel.live",
    sentryIngestOrigin,
  ]
    .filter(Boolean)
    .join(" "),
  "media-src 'self' blob: https:",
  // google.com is the Maps embed on /contact ("output=embed"), which the
  // browser audit caught rendering as a blank frame under the first draft of
  // this policy.
  [
    "frame-src",
    "'self'",
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com",
    "https://open.spotify.com",
    "https://checkout.paystack.com",
    "https://www.paypal.com",
    "https://www.sandbox.paypal.com",
    "https://www.google.com",
    "https://maps.google.com",
  ].join(" "),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.paystack.com https://www.paypal.com https://www.sandbox.paypal.com",
  "frame-ancestors 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    // A bare `payment=(self)` / `fullscreen=(self)` would block the embedded
    // third parties that need exactly those two: the Paystack and PayPal
    // checkout frames use the Payment Request API, and the YouTube/Spotify
    // players own their fullscreen button. Permissions-Policy applies to
    // iframes as well as the top document, so the origins have to be named.
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      'payment=(self "https://checkout.paystack.com" "https://www.paypal.com" "https://www.sandbox.paypal.com")',
      'fullscreen=(self "https://www.youtube.com" "https://www.youtube-nocookie.com" "https://open.spotify.com")',
    ].join(", "),
  },
];

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP second, original as the last resort. Both are far
    // smaller than the source JPEG/PNG at the same perceived quality.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        // Several section pages still open on Unsplash stock. Routing them
        // through the image optimizer means they are served resized and
        // re-encoded rather than as full-size JPEGs.
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // Next only sets long-lived caching on its own hashed `/_next/static`
  // output. Everything in `/public` — our photography, posters and video —
  // was being served `max-age=0`, so returning visitors re-fetched all of it.
  // These files are replaced by hand rather than content-hashed, so this is a
  // month rather than `immutable`: swap a file and it is picked up within 30
  // days, or sooner by renaming it.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/:path*.(mp4|webm|jpg|jpeg|png|webp|avif|svg|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },

  // Aliases for the three policy pages, pointing at the canonical paths.
  //
  // These exist because a policy URL is written down in places we do not
  // control and cannot edit quickly: the Play Console listing, the App Store
  // listing, and the bundle of any installed app — EXPO_PUBLIC_WEB_URL is
  // inlined at build time, so a phone that has not taken the latest update
  // still requests whatever URL it shipped with. A 404 on a policy link is an
  // enforcement trigger rather than a broken page, so the cheap fix is to make
  // the obvious variants resolve instead of relying on everyone typing the
  // canonical one.
  //
  // Permanent, because these are aliases rather than a migration in progress —
  // if a path here is ever meant to become a real page, drop its entry first
  // and let the 308 expire from browser caches before shipping the page.
  async redirects() {
    const alias = (from: string, to: string) => ({
      source: from,
      destination: to,
      permanent: true,
    });

    return [
      alias("/privacy-policy", "/privacy"),
      alias("/privacypolicy", "/privacy"),
      alias("/legal", "/privacy"),
      alias("/legal/privacy", "/privacy"),

      alias("/terms-of-use", "/terms"),
      alias("/terms-of-service", "/terms"),
      alias("/tos", "/terms"),
      alias("/legal/terms", "/terms"),

      // The deletion URL is the one most likely to be entered from memory, and
      // Play asks for it in a different part of the console from the policy.
      alias("/delete-account", "/privacy/delete-account"),
      alias("/account-deletion", "/privacy/delete-account"),
      alias("/data-deletion", "/privacy/delete-account"),
      alias("/privacy/delete", "/privacy/delete-account"),
    ];
  },
};

// Source maps are uploaded only when an auth token is present, so a plain
// `next build` — local, CI, or a fork without the secret — still succeeds and
// simply ships without readable stack traces.
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

// Silence here is indistinguishable from success: without a token the upload is
// skipped, the build still passes, and the first sign of trouble is a minified
// frame in Sentry weeks later. Say so at build time instead. A warning rather
// than a hard failure, so a fork or a local build without the secret still
// builds — the same trade the mobile OTA script makes.
if (isProd && !sentryAuthToken) {
  console.warn(
    "[sentry] SENTRY_AUTH_TOKEN is not set — source maps will NOT be uploaded " +
      "and production stack traces will stay minified.",
  );
}

export default withBundleAnalyzer(withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: sentryAuthToken,

  silent: !process.env.CI,

  // Uploads the maps and then deletes them from the deployed output, so the
  // stack traces are readable in Sentry without publishing our source to
  // anyone who opens devtools.
  sourcemaps: {
    disable: !sentryAuthToken,
    deleteSourcemapsAfterUpload: true,
  },

  // Covers the client bundle's chunks as well as the page files, which is what
  // makes a minified frame inside a shared chunk resolve.
  widenClientFileUpload: true,

  // No `disableLogger` here: it is deprecated in favour of
  // `webpack.treeshake.removeDebugLogging`, and neither applies to this build —
  // the project compiles with Turbopack, which that option does not support.
}));
