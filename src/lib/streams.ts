/**
 * Ecclesia TV (HLS) and Ecclesia Radio stream URLs.
 *
 * https only: the site is served over https, so a plaintext stream would be
 * blocked as mixed content, and the CSP's `upgrade-insecure-requests` would
 * rewrite it to a scheme the stream server may not offer. The API enforces the
 * same rule; this guards the admin form and any older row. Returns "" for
 * anything unusable so callers can treat "no stream" as one case.
 */
export function normalizeStreamUrl(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? "";
  return /^https:\/\/\S+$/i.test(trimmed) ? trimmed : "";
}
