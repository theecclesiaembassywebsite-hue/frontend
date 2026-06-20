"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { setToken } from "@/lib/api";

const SAFE_REDIRECTS = new Set(['/dashboard', '/admin', '/auth/login', '/blog']);

function getHashParam(name: string) {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#/, '');
  return new URLSearchParams(hash).get(name);
}

function normalizeRedirect(redirect: string | null): string {
  if (!redirect) return '/dashboard';
  if (!redirect.startsWith('/')) return '/dashboard';
  return SAFE_REDIRECTS.has(redirect) ? redirect : '/dashboard';
}

function CallbackHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = getHashParam('token');
    const redirect = normalizeRedirect(searchParams.get('redirect'));

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
