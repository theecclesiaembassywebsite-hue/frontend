"use client";

import { useCallback, useEffect, useRef } from "react";
import { setToken } from "@/lib/api";

type GoogleAuthMessage =
  | { type: "google-auth-success"; token: string; redirect: string }
  | { type: "google-auth-error" };

function isGoogleAuthMessage(data: unknown): data is GoogleAuthMessage {
  return typeof data === "object" && data !== null && "type" in data;
}

export function useGoogleAuthPopup(onError?: (message: string) => void) {
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!isGoogleAuthMessage(event.data)) return;

      if (event.data.type === "google-auth-success") {
        popupRef.current?.close();
        setToken(event.data.token);
        window.location.assign(event.data.redirect || "/dashboard");
      } else if (event.data.type === "google-auth-error") {
        popupRef.current?.close();
        onError?.("Google sign-in failed. Please try again.");
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
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
