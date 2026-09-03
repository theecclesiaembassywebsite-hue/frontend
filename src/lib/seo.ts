import type { Metadata } from "next";

// Falls back to the live production domain rather than localhost so that a
// build without NEXT_PUBLIC_SITE_URL set (a fork, a preview without the var
// wired up) still emits absolute, crawlable canonical/OG URLs instead of
// silently pointing at http://localhost.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://ecclesia-iota.vercel.app"
).replace(/\/+$/, "");

export const SITE_NAME = "The Ecclesia Embassy";

export const SITE_DESCRIPTION =
  "The Ecclesia Embassy is a global apostolic and prophetic movement raising Word-cultured ambassadors through worship, teaching, prayer, and community.";

interface BuildMetadataOptions {
  title: string;
  description: string;
  /** Site-relative path, e.g. "/about". Used for the canonical URL and OG url. */
  path: string;
  /** Site-relative image path, e.g. "/site/about-hero.jpg". Defaults to the shared OG image. */
  ogImage?: string;
  /** Set for pages that should not be indexed (private/app routes). */
  noIndex?: boolean;
}

/**
 * One call per page fills in canonical + OpenGraph + Twitter consistently,
 * so per-page `metadata` exports stay a few lines instead of re-deriving
 * these three objects by hand on every route.
 */
export function buildMetadata({
  title,
  description,
  path,
  ogImage,
  noIndex,
}: BuildMetadataOptions): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    ...(noIndex
      ? { robots: { index: false, follow: false } }
      : {}),
  };
}
