import { afterEach, describe, expect, it, vi } from "vitest";

async function load(siteKey = "") {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", siteKey);
  return import("@/lib/form-guard");
}

afterEach(() => vi.unstubAllEnvs());

describe("form guard", () => {
  it("only treats the public form endpoints as guarded", async () => {
    const g = await load();
    for (const ep of [
      "/prayer-requests",
      "/contact",
      "/first-timer",
      "/first-timer/new-convert",
      "/events/abc/register",
      "/events/abc/register-and-pay",
      "/training/TEMA/enroll",
      "/cith/ehub/register",
      "/auth/register",
      "/auth/forgot-password",
      "/auth/resend-verification",
    ]) {
      expect(g.isGuardedRequest(ep, "POST")).toBe(true);
    }
    expect(g.isGuardedRequest("/prayer-requests", "GET")).toBe(false);
    expect(g.isGuardedRequest("/auth/login", "POST")).toBe(false);
    expect(g.isGuardedRequest("/auth/reset-password", "POST")).toBe(false);
    expect(g.isGuardedRequest("/prayer-requests/mine", "POST")).toBe(false);
  });

  it("leaves the body alone when no form has mounted the guard", async () => {
    const g = await load();
    expect(g.withFormGuard('{"a":1}')).toBe('{"a":1}');
  });

  it("merges honeypot, fill time and token into the body", async () => {
    const g = await load("site-key");
    const reg = {
      startedAt: 123,
      honeypot: { value: "" } as HTMLInputElement,
      token: "tok",
      resetWidget: vi.fn(),
    };
    g.registerFormGuard(reg);
    expect(JSON.parse(g.withFormGuard('{"name":"Grace"}') as string)).toEqual({
      name: "Grace",
      website: "",
      formStartedAt: 123,
      captchaToken: "tok",
    });
  });

  it("refuses to submit before the captcha has finished", async () => {
    const g = await load("site-key");
    g.registerFormGuard({
      startedAt: 1,
      honeypot: null,
      token: null,
      resetWidget: vi.fn(),
    });
    expect(() => g.withFormGuard('{"a":1}')).toThrow(g.FormGuardPendingError);
  });

  it("sends without a token when the widget could not run", async () => {
    const g = await load("site-key");
    g.registerFormGuard({
      startedAt: 1,
      honeypot: null,
      token: null,
      failed: true,
      resetWidget: vi.fn(),
    });
    expect(JSON.parse(g.withFormGuard('{"a":1}') as string)).not.toHaveProperty("captchaToken");
  });

  it("resets the token and timer after an attempt", async () => {
    const g = await load("site-key");
    const reset = vi.fn();
    const reg = { startedAt: 1, honeypot: null, token: "tok", resetWidget: reset };
    g.registerFormGuard(reg);
    g.resetFormGuard();
    expect(reg.token).toBeNull();
    expect(reg.startedAt).toBeGreaterThan(1);
    expect(reset).toHaveBeenCalled();
  });
});
