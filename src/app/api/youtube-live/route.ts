// Tracks live status for YouTube channel @theecclesiaembassy (UCrvZyTocoH926b_wv81bpzA).
// Primary: YouTube Data API v3 (reliable, needs YOUTUBE_API_KEY env var).
// Fallback: HTML scraping — used when the key is missing or quota drops to 500 units remaining.
// When scraping finds a YouTube redirect to a watch URL but can't confirm live markers in the
// initial HTML, CHANNEL_FALLBACK is returned so a real stream is never silently dropped.
import { isQuotaSafe, consumeQuota } from "@/lib/youtube-quota";

const CHANNEL_ID = "UCrvZyTocoH926b_wv81bpzA";
const CACHE_TTL_MS = 5 * 60_000;
const UNCERTAIN_CACHE_TTL_MS = 60_000;
const SEARCH_COST = 100; // units per search.list call
const CHANNEL_FALLBACK_URL = `https://www.youtube.com/embed/live_stream?channel=${CHANNEL_ID}&autoplay=1`;

interface LiveStatus {
  isLive: boolean;
  videoId: string | null;
  embedUrl: string | null;
  fallbackUrl?: string | null;
  useFallbackEmbed?: boolean;
}

const NOT_LIVE: LiveStatus = { isLive: false, videoId: null, embedUrl: null };
const CHANNEL_FALLBACK: LiveStatus = {
  isLive: false,
  videoId: null,
  embedUrl: null,
  fallbackUrl: CHANNEL_FALLBACK_URL,
  useFallbackEmbed: true,
};

let cached: { status: LiveStatus; expiresAt: number } | null = null;

async function fetchViaApi(apiKey: string): Promise<string | null> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${CHANNEL_ID}&eventType=live&type=video&maxResults=1&key=${apiKey}`,
    { signal: AbortSignal.timeout(10_000) }
  );

  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    const reason = body?.error?.errors?.[0]?.reason ?? "";
    if (reason === "quotaExceeded" || reason === "dailyLimitExceeded") {
      return "QUOTA_EXCEEDED";
    }
  }

  if (!res.ok) throw new Error(`API ${res.status}`);

  consumeQuota(SEARCH_COST);
  const data = await res.json();
  return data.items?.[0]?.id?.videoId ?? null;
}

// Returns a video ID when confirmed live, "UNCERTAIN" when YouTube redirected to a watch
// URL but live markers were absent from the initial HTML (stream may be starting up or
// markers stripped by YouTube's CDN), and null when definitely not live.
async function fetchViaScraping(): Promise<string | "UNCERTAIN" | null> {
  const res = await fetch(
    `https://www.youtube.com/channel/${CHANNEL_ID}/live`,
    {
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Cookie: "CONSENT=YES+; SOCS=CAI",
      },
    }
  );

  if (res.url.includes("consent.youtube.com")) return null;

  // No redirect to a watch URL means YouTube served the generic /live page — no active stream.
  const watchMatch = /[?&]v=([a-zA-Z0-9_-]{11})/.exec(res.url);
  if (!watchMatch) return null;

  const videoId = watchMatch[1];
  const html = await res.text();

  // "isLiveBroadcast":true and "liveBadge" also appear on ended streams, so we exclude them.
  const isLive =
    html.includes('"isLive":true') ||
    html.includes('"broadcastStatus":"live"');

  if (isLive) return videoId;

  // YouTube redirected to a watch URL but live markers are absent — signal uncertainty
  // rather than returning null, so the caller can show the channel embed as a safe fallback.
  return "UNCERTAIN";
}

async function fetchLiveStatus(): Promise<LiveStatus> {
  const now = Date.now();
  if (cached && now < cached.expiresAt) return cached.status;

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    let videoId: string | null = null;
    let uncertain = false;

    const applyScrapingResult = (result: string | "UNCERTAIN" | null) => {
      if (result === "UNCERTAIN") {
        uncertain = true;
      } else {
        videoId = result;
      }
    };

    if (apiKey && isQuotaSafe(SEARCH_COST)) {
      const apiResult = await fetchViaApi(apiKey);
      if (apiResult === "QUOTA_EXCEEDED") {
        applyScrapingResult(await fetchViaScraping());
      } else if (apiResult) {
        videoId = apiResult;
      } else {
        // API found no live stream — scrape as a secondary check to catch streams not yet
        // indexed by YouTube search (can take 1–2 minutes after broadcast starts).
        applyScrapingResult(await fetchViaScraping());
      }
    } else {
      applyScrapingResult(await fetchViaScraping());
    }

    if (!videoId) {
      // Uncertain means YouTube redirected to a watch URL but we couldn't confirm live status
      // from HTML — show the channel embed so a real stream is never silently hidden.
      const status = uncertain ? CHANNEL_FALLBACK : NOT_LIVE;
      cached = { status, expiresAt: now + (uncertain ? UNCERTAIN_CACHE_TTL_MS : CACHE_TTL_MS) };
      return status;
    }

    const status: LiveStatus = {
      isLive: true,
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
    };

    cached = { status, expiresAt: now + CACHE_TTL_MS };
    return status;
  } catch {
    // On any unexpected error fall back to the channel iframe rather than
    // silently dropping visitors to the countdown screen.
    cached = { status: CHANNEL_FALLBACK, expiresAt: now + 30_000 };
    return CHANNEL_FALLBACK;
  }
}

export async function GET() {
  const status = await fetchLiveStatus();
  return Response.json(status);
}
