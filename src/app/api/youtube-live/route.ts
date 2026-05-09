// Tracks live status for YouTube channel @theecclesiaembassy (UCrvZyTocoH926b_wv81bpzA).
// Primary: YouTube Data API v3 (reliable, needs YOUTUBE_API_KEY env var).
// Fallback: HTML scraping — used automatically when the key is missing or daily quota is exceeded.
const CHANNEL_ID = "UCrvZyTocoH926b_wv81bpzA";
const LIVE_DELAY_MS = 60_000;
// Server-side cache shared across all clients. Each refresh = 100 YouTube API quota units.
// 5-min TTL → at most ~288 refreshes/day (28,800 units). Free quota is 10,000 units/day;
// request a free quota increase in Google Cloud Console if needed.
const CACHE_TTL_MS = 5 * 60_000;

interface LiveStatus {
  isLive: boolean;
  videoId: string | null;
  embedUrl: string | null;
}

const NOT_LIVE: LiveStatus = { isLive: false, videoId: null, embedUrl: null };

let cached: { status: LiveStatus; expiresAt: number } | null = null;
let firstDetectedLiveAt: number | null = null;

async function fetchViaApi(apiKey: string): Promise<string | null> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${CHANNEL_ID}&eventType=live&type=video&maxResults=1&key=${apiKey}`,
    { signal: AbortSignal.timeout(10_000) }
  );

  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    const reason = body?.error?.errors?.[0]?.reason ?? "";
    // Quota exceeded — signal caller to fall back to scraping.
    if (reason === "quotaExceeded" || reason === "dailyLimitExceeded") {
      return "QUOTA_EXCEEDED";
    }
  }

  if (!res.ok) throw new Error(`API ${res.status}`);

  const data = await res.json();
  return data.items?.[0]?.id?.videoId ?? null;
}

async function fetchViaScraping(): Promise<string | null> {
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

  const html = await res.text();
  const watchMatch = /[?&]v=([a-zA-Z0-9_-]{11})/.exec(res.url);
  const htmlVideoMatch = /"videoId":"([a-zA-Z0-9_-]{11})"/.exec(html);
  const videoId = watchMatch?.[1] ?? htmlVideoMatch?.[1] ?? null;

  const isLive =
    videoId !== null &&
    (html.includes('"isLive":true') ||
      html.includes('"isLiveBroadcast":true') ||
      html.includes('"broadcastStatus":"live"') ||
      html.includes('"liveBadge"'));

  return isLive ? videoId : null;
}

async function fetchLiveStatus(): Promise<LiveStatus> {
  const now = Date.now();
  if (cached && now < cached.expiresAt) return cached.status;

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    let videoId: string | null;

    if (apiKey) {
      const result = await fetchViaApi(apiKey);
      // On quota exceeded, transparently fall back to scraping.
      videoId = result === "QUOTA_EXCEEDED" ? await fetchViaScraping() : result;
    } else {
      videoId = await fetchViaScraping();
    }

    if (!videoId) {
      firstDetectedLiveAt = null;
      cached = { status: NOT_LIVE, expiresAt: now + CACHE_TTL_MS };
      return NOT_LIVE;
    }

    // Enforce the 1-minute delay before surfacing the stream to visitors.
    if (firstDetectedLiveAt === null) {
      firstDetectedLiveAt = now;
    }

    const delayElapsed = now - firstDetectedLiveAt >= LIVE_DELAY_MS;

    if (!delayElapsed) {
      const remaining = LIVE_DELAY_MS - (now - firstDetectedLiveAt);
      cached = { status: NOT_LIVE, expiresAt: now + remaining };
      return NOT_LIVE;
    }

    const status: LiveStatus = {
      isLive: true,
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
    };

    cached = { status, expiresAt: now + CACHE_TTL_MS };
    return status;
  } catch {
    cached = { status: NOT_LIVE, expiresAt: now + 30_000 };
    return NOT_LIVE;
  }
}

export async function GET() {
  const status = await fetchLiveStatus();
  return Response.json(status);
}
