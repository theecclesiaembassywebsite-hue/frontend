import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

function withYouTubePlayerParams(url: string) {
  const parsed = new URL(url);

  if (!parsed.searchParams.has("autoplay")) {
    parsed.searchParams.set("autoplay", "1");
  }

  if (!parsed.searchParams.has("rel")) {
    parsed.searchParams.set("rel", "0");
  }

  if (!parsed.searchParams.has("modestbranding")) {
    parsed.searchParams.set("modestbranding", "1");
  }

  if (!parsed.searchParams.has("playsinline")) {
    parsed.searchParams.set("playsinline", "1");
  }

  return parsed.toString();
}

/**
 * Normalize any livestream input into a clean embed URL.
 * Accepts: full <iframe> HTML, YouTube watch/short/embed/live_stream URLs,
 * Vimeo URLs, or a bare YouTube video ID.
 * Returns null if nothing usable can be extracted.
 */
export function normalizeEmbedUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  let s = input.trim();
  if (!s) return null;

  // If the admin pasted the full <iframe ... src="..."> HTML, extract src.
  const iframeMatch = s.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  if (iframeMatch) s = iframeMatch[1];

  // Bare 11-char YouTube video ID
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) {
    return withYouTubePlayerParams(`https://www.youtube.com/embed/${s}`);
  }

  // YouTube watch URL: https://www.youtube.com/watch?v=ID
  const watchMatch = s.match(/youtube\.com\/watch\?(?:[^#]*&)?v=([A-Za-z0-9_-]{11})/i);
  if (watchMatch) {
    return withYouTubePlayerParams(`https://www.youtube.com/embed/${watchMatch[1]}`);
  }

  // youtu.be short link: https://youtu.be/ID
  const shortMatch = s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/i);
  if (shortMatch) {
    return withYouTubePlayerParams(`https://www.youtube.com/embed/${shortMatch[1]}`);
  }

  // YouTube live_stream?channel=UCxxx — valid embed, use as-is
  if (/youtube\.com\/embed\/live_stream\?channel=/i.test(s)) {
    return withYouTubePlayerParams(s);
  }

  // Already an embed URL
  if (/youtube\.com\/embed\//i.test(s)) {
    return withYouTubePlayerParams(s);
  }

  if (/player\.vimeo\.com\//i.test(s)) {
    return s;
  }

  // Generic http(s) URL — return as-is and let the iframe try it
  if (/^https?:\/\//i.test(s)) return s;

  return null;
}
