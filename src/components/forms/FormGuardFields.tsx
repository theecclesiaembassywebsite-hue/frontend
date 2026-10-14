"use client";

import { useEffect, useRef } from "react";
import {
  registerFormGuard,
  TURNSTILE_ACTION,
  TURNSTILE_SITE_KEY,
} from "@/lib/form-guard";

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      action?: string;
      appearance?: "always" | "execute" | "interaction-only";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<void> | null = null;
function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error("Turnstile failed to load"));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

/**
 * Drop inside any public <form>. Renders the honeypot (invisible to people)
 * and, when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set, the Cloudflare Turnstile
 * widget. fetchAPI merges the result into the submission; see lib/form-guard.
 */
export function FormGuardFields() {
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let widgetId: string | undefined;
    let cancelled = false;

    const reg = {
      startedAt: Date.now(),
      honeypot: honeypotRef.current,
      token: null as string | null,
      failed: false,
      resetWidget: () => {
        if (widgetId && window.turnstile) window.turnstile.reset(widgetId);
      },
    };
    const unregister = registerFormGuard(reg);

    // The widget is only visible when Cloudflare challenges the visitor, and a
    // challenge belongs next to the submit button, not above the first field.
    // So it gets its own node, placed just before the submit button's block.
    // It is created here rather than rendered by React because React would
    // otherwise try to manage a node that has been moved.
    let host: HTMLDivElement | null = null;
    if (TURNSTILE_SITE_KEY && honeypotRef.current) {
      const form = honeypotRef.current.closest("form");
      host = document.createElement("div");
      const submit = form?.querySelector('[type="submit"]');
      let anchor: Element | null = submit ?? null;
      while (anchor && anchor.parentElement !== form) anchor = anchor.parentElement;
      if (form && anchor) form.insertBefore(host, anchor);
      else if (form) form.appendChild(host);
      else host = null;
    }

    if (TURNSTILE_SITE_KEY && host) {
      const mount = host;
      loadTurnstile()
        .then(() => {
          if (cancelled || !window.turnstile) return;
          widgetId = window.turnstile.render(mount, {
            sitekey: TURNSTILE_SITE_KEY,
            action: TURNSTILE_ACTION,
            // Stays invisible unless Cloudflare needs the visitor to do something.
            appearance: "interaction-only",
            callback: (token) => {
              reg.token = token;
            },
            "expired-callback": () => {
              reg.token = null;
            },
            "error-callback": () => {
              reg.token = null;
              reg.failed = true;
            },
          });
        })
        .catch(() => {
          // Script blocked or offline: send the form without a token. The
          // backend only refuses a missing token once told to require one.
          reg.failed = true;
        });
    }

    return () => {
      cancelled = true;
      unregister();
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
      host?.remove();
    };
  }, []);

  return (
    <>
      {/* Honeypot: off-screen rather than display:none, which some bots skip. */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}
      >
        <label>
          Leave this field empty
          <input
            ref={honeypotRef}
            type="text"
            name="fax_confirmation"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </label>
      </div>
    </>
  );
}
