"use client";

import { useCallback, useEffect, useRef } from "react";

type GoogleAuthMessage =
  | { type: "google-auth-success"; redirect: string }
  | { type: "google-auth-error"; reason?: string | null }
  | { type: "google-auth-ack" };

// The API answers with `Cross-Origin-Opener-Policy: same-origin`, which
// severs window.opener for a popup that visits it — so the callback page
// cannot postMessage back. A same-origin BroadcastChannel reaches the opener
// regardless of browsing-context groups.
export const GOOGLE_AUTH_CHANNEL = "google-auth";

function isGoogleAuthMessage(data: unknown): data is GoogleAuthMessage {
  return typeof data === "object" && data !== null && "type" in data;
}

export function useGoogleAuthPopup(onError?: (message: string) => void) {
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    function handleResult(data: unknown) {
      if (!isGoogleAuthMessage(data)) return;

      if (data.type === "google-auth-success") {
        popupRef.current?.close();
        // No token to stash: the backend already set the session cookie, and
        // it is deliberately not passed through the URL or this message.
        window.location.assign(data.redirect || "/dashboard");
      } else if (data.type === "google-auth-error") {
        popupRef.current?.close();
        // A cancelled consent screen is not an error worth alarming anyone
        // about — it is the user changing their mind, and it used to surface
        // as a bare 401 inside the popup with no message at all.
        onError?.(
          data.reason === "cancelled"
            ? "Google sign-in was cancelled."
            : "Google sign-in failed. Please try again."
        );
      }
    }

    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      handleResult(event.data);
    }

    window.addEventListener("message", handleMessage);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(GOOGLE_AUTH_CHANNEL);
      channel.onmessage = (event: MessageEvent) => {
        if (!isGoogleAuthMessage(event.data)) return;
        if (event.data.type === "google-auth-ack") return;
        // Lets the popup know someone is here to take over, so it can close
        // instead of navigating itself.
        channel?.postMessage({ type: "google-auth-ack" });
        handleResult(event.data);
      };
    }

    return () => {
      window.removeEventListener("message", handleMessage);
      channel?.close();
    };
  }, [onError]);

  const openGoogleAuth = useCallback(() => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      url,
      "google-oauth",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      // Popup blocked by the browser — fall back to a full-page redirect
      window.location.assign(url);
      return;
    }

    popupRef.current = popup;
  }, []);

  return { openGoogleAuth };
}
