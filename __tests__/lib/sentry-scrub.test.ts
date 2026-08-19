import { describe, it, expect } from "vitest";
import type { ErrorEvent, EventHint } from "@sentry/nextjs";

import { baseSentryOptions } from "@/lib/observability/sentry-options";
import { scrub, scrubHeaders, scrubUrl, REDACTED } from "@/lib/observability/scrub";

// beforeSend is the last gate before an event leaves the browser, so these
// assert on what actually goes over the wire rather than on scrub() alone.
function runBeforeSend(event: ErrorEvent): ErrorEvent | null {
  const options = baseSentryOptions("https://key@o0.ingest.sentry.io/1");
  const hook = options.beforeSend;
  if (!hook) throw new Error("beforeSend is not configured");
  return hook(event, {} as EventHint) as ErrorEvent | null;
}

describe("scrub", () => {
  it("redacts credential-bearing keys at any nesting depth", () => {
    const result = scrub({
      ok: "keep me",
      password: "hunter2",
      nested: { refreshToken: "abc", deep: { apiKey: "xyz" } },
    }) as Record<string, unknown>;

    expect(result.ok).toBe("keep me");
    expect(result.password).toBe(REDACTED);
    expect((result.nested as Record<string, unknown>).refreshToken).toBe(REDACTED);
  });

  it("redacts direct identifiers of a person", () => {
    const result = scrub({ email: "someone@example.com", phone: "08012345678" }) as Record<
      string,
      unknown
    >;

    expect(result.email).toBe(REDACTED);
    expect(result.phone).toBe(REDACTED);
  });

  it("redacts values that look like secrets even under an innocent key", () => {
    const result = scrub({
      payload: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature",
      note: "sk_live_abcdefgh12345678",
    }) as Record<string, unknown>;

    expect(result.payload).toBe(REDACTED);
    expect(result.note).toBe(REDACTED);
  });

  it("bounds recursion instead of hanging on a cyclic payload", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;

    expect(() => scrub(cyclic)).not.toThrow();
  });

  it("keeps only allowlisted headers", () => {
    const result = scrubHeaders({
      "user-agent": "Mozilla/5.0",
      authorization: "Bearer secret",
      cookie: "session=abc",
    });

    expect(result["user-agent"]).toBe("Mozilla/5.0");
    expect(result.authorization).toBeUndefined();
    expect(result.cookie).toBeUndefined();
  });

  it("drops the query string, which carries reset and payment tokens", () => {
    expect(scrubUrl("/verify?token=abc123")).toBe("/verify?[redacted]");
    expect(scrubUrl("/about")).toBe("/about");
  });
});

describe("beforeSend", () => {
  it("strips cookies and query strings off the request", () => {
    const event = runBeforeSend({
      type: undefined,
      request: {
        method: "POST",
        url: "https://app.example.org/giving?reference=pay_123",
        headers: { "user-agent": "Mozilla/5.0", cookie: "session=abc" },
        cookies: { session: "abc" },
        query_string: "reference=pay_123",
        data: { amount: 500, email: "giver@example.com" },
      },
    } as ErrorEvent);

    expect(event?.request?.url).toBe("https://app.example.org/giving?[redacted]");
    expect(event?.request?.cookies).toBeUndefined();
    expect(event?.request?.query_string).toBeUndefined();
    expect(event?.request?.headers?.cookie).toBeUndefined();
    expect((event?.request?.data as Record<string, unknown>).email).toBe(REDACTED);
    expect((event?.request?.data as Record<string, unknown>).amount).toBe(500);
  });

  it("reduces the user down to an id so an event is not a member record", () => {
    const event = runBeforeSend({
      type: undefined,
      user: { id: "user_1", email: "someone@example.com", username: "sidney" },
    } as ErrorEvent);

    expect(event?.user).toEqual({ id: "user_1" });
  });

  it("scrubs extra context", () => {
    const event = runBeforeSend({
      type: undefined,
      extra: { formState: { password: "hunter2", step: 2 } },
    } as ErrorEvent);

    const formState = (event?.extra as Record<string, Record<string, unknown>>).formState;
    expect(formState.password).toBe(REDACTED);
    expect(formState.step).toBe(2);
  });
});

describe("beforeBreadcrumb", () => {
  it("drops console breadcrumbs and redacts URLs on the rest", () => {
    const options = baseSentryOptions("https://key@o0.ingest.sentry.io/1");
    const hook = options.beforeBreadcrumb;
    if (!hook) throw new Error("beforeBreadcrumb is not configured");

    expect(hook({ category: "console", message: "leaked" }, {})).toBeNull();

    const http = hook(
      { category: "fetch", data: { url: "https://api.paystack.co/verify?ref=abc" } },
      {}
    );
    expect(http?.data?.url).toBe("https://api.paystack.co/verify?[redacted]");
  });
});
