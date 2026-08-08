"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function normalizeRedirect(redirect: string | null): string {
  if (!redirect) return '/dashboard';

  // An allowlist rather than a denylist: the value must look like an in-app
  // path and nothing else. Written this way because the interesting bypasses
  // are all things a denylist forgets — a backslash (`/\evil.com`, which
  // browsers normalize to the protocol-relative `//evil.com`), a tab or a
  // newline spliced in, a stray control character. None of those are in the
  // allowed set, so none need to be enumerated.
  if (!/^\/[A-Za-z0-9\-._~!$&'()*+,;=:@/?%[\]]*$/.test(redirect)) {
    return '/dashboard';
  }

  // Still rejected explicitly: a leading `//` is protocol-relative and points
  // off-site even though every character in it is allowed above.
  if (redirect.startsWith('//')) return '/dashboard';

  return redirect;
}

function CallbackHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // The session arrives as the httpOnly cookie the backend set before
    // redirecting here — never as a token in this URL. Reaching this route with
    // status=success means Passport verified the Google callback server-side.
    const succeeded = searchParams.get('status') === 'success';
    const redirect = normalizeRedirect(searchParams.get('redirect'));

    // Opened as a popup from the Google sign-in button: relay the result to
    // the opener window and close, instead of navigating this popup itself.
    if (window.opener && window.opener !== window) {
      window.opener.postMessage(
        succeeded
          ? { type: 'google-auth-success', redirect }
          : { type: 'google-auth-error' },
        window.location.origin
      );
      window.close();
      return;
    }

    if (succeeded) {
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
