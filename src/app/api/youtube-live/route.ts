const CHANNEL_ID = "UCrvZyTocoH926b_wv81bpzA";

interface LiveStatus {
  isLive: boolean;
  videoId: string | null;
  embedUrl: string | null;
}

const NOT_LIVE: LiveStatus = { isLive: false, videoId: null, embedUrl: null };

// Module-level cache so repeated client polls don't hammer YouTube.
let cached: { status: LiveStatus; expiresAt: number } | null = null;

async function fetchLiveStatus(): Promise<LiveStatus> {
  const now = Date.now();
  if (cached && now < cached.expiresAt) return cached.status;

  try {
    const res = await fetch(
      `https://www.youtube.com/channel/${CHANNEL_ID}/live`,
      {
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          Cookie: "CONSENT=YES+; SOCS=CAI",
        },
      }
    );

    // Consent wall redirect — can't detect status.
    if (res.url.includes("consent.youtube.com")) {
      cached = { status: NOT_LIVE, expiresAt: now + 60_000 };
      return NOT_LIVE;
    }

    const html = await res.text();

    // If the final URL is a /watch?v= page the channel redirected us to a video.
    const watchMatch = /[?&]v=([a-zA-Z0-9_-]{11})/.exec(res.url);
    // Also try finding videoId in the page JSON blob.
    const htmlVideoMatch = /"videoId":"([a-zA-Z0-9_-]{11})"/.exec(html);

    const videoId = watchMatch?.[1] ?? htmlVideoMatch?.[1] ?? null;

    const isLive =
      videoId !== null &&
      (html.includes('"isLive":true') ||
        html.includes('"isLiveBroadcast":true') ||
        html.includes('"broadcastStatus":"live"') ||
        html.includes('"liveBadge"') ||
        // If we got a /watch redirect from /live, treat it as live.
        watchMatch !== null);

    const status: LiveStatus = isLive
      ? {
          isLive: true,
          videoId,
          embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
        }
      : NOT_LIVE;

    cached = { status, expiresAt: now + 60_000 };
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
