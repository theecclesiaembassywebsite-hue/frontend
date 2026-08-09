"use client";

import { useEffect } from "react";

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

export default function AuthCallbackPage() {
  useEffect(() => {
    // Read the query string straight off the URL instead of through
    // useSearchParams(). This route is statically prerendered, so the hook can
    // still be empty on the first client render — and "no status" is exactly
    // our failure signal, which turned successful sign-ins into
    // "Google sign-in failed. Please try again." intermittently in production.
    // window.location.search is populated before any React code runs, needs no
    // Suspense boundary, and is the right source for a popup handler.
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const redirect = normalizeRedirect(params.get('redirect'));

    // The session arrives as the httpOnly cookie the backend set before
    // redirecting here — never as a token in this URL. status=success means
    // Passport verified the Google callback server-side.
    const succeeded = status === 'success';

    // Opened as a popup from the Google sign-in button: relay the result to
    // the opener window and close, instead of navigating this popup itself.
    if (window.opener && window.opener !== window) {
      window.opener.postMessage(
        succeeded
          ? { type: 'google-auth-success', redirect }
          : { type: 'google-auth-error', reason: params.get('reason') },
        window.location.origin
      );
      window.close();
      return;
    }

    if (succeeded) {
      window.location.assign(redirect);
    } else {
      const reason = params.get('reason');
      window.location.assign(
        `/auth/login?error=google_failed${reason ? `&reason=${encodeURIComponent(reason)}` : ''}`
      );
    }
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-off-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-lavender border-t-gold" />
        <p className="font-body text-sm text-gray-text">Completing sign-in…</p>
      </div>
    </div>
  );
}
