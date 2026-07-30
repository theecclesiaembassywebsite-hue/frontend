"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { setToken } from "@/lib/api";

function normalizeRedirect(redirect: string | null): string {
  if (!redirect) return '/dashboard';
  // Block external URLs and protocol-relative URLs (//evil.com)
  if (!redirect.startsWith('/') || redirect.startsWith('//')) return '/dashboard';
  return redirect;
}

function CallbackHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const redirect = normalizeRedirect(searchParams.get('redirect'));

    // Opened as a popup from the Google sign-in button: relay the result to
    // the opener window and close, instead of navigating this popup itself.
    if (window.opener && window.opener !== window) {
      if (token) {
        window.opener.postMessage(
          { type: 'google-auth-success', token, redirect },
          window.location.origin
        );
      } else {
        window.opener.postMessage({ type: 'google-auth-error' }, window.location.origin);
      }
      window.close();
      return;
    }

    if (token) {
      setToken(token);
      window.location.assign(redirect);
    } else {
      window.location.assign('/auth/login?error=google_failed');
    }
  }, [searchParams]);

  return (
    <div className="flex h-screen items-center justify-center bg-off-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-lavender border-t-gold" />
        <p className="font-body text-sm text-gray-text">Completing sign-in…</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-off-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-lavender border-t-gold" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
