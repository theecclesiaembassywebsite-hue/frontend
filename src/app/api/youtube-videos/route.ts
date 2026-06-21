// Fetches recent completed livestreams for YouTube channel
// @theecclesiaembassy (UCrvZyTocoH926b_wv81bpzA).
// Primary: YouTube Data API v3 (needs YOUTUBE_API_KEY env var).
// Fallback: RSS feed — used when the key is missing or quota drops to 500 units remaining.
import { isQuotaSafe, consumeQuota } from "@/lib/youtube-quota";

const CHANNEL_ID = "UCrvZyTocoH926b_wv81bpzA";
const CACHE_TTL_MS = 60 * 60_000; // 1 hour
const SEARCH_COST = 100; // units per search.list call
const VIDEOS_COST = 1; // units per videos.list call

interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
}

let cached: { videos: YouTubeVideo[]; expiresAt: number } | null = null;

async function fetchViaApi(apiKey: string): Promise<YouTubeVideo[] | "QUOTA_EXCEEDED"> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=id,snippet&channelId=${CHANNEL_ID}&eventType=completed&order=date&type=video&maxResults=4&key=${apiKey}`,
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
  return (data.items ?? [])
    .filter((item: {
      id?: { videoId?: string };
      snippet?: { liveBroadcastContent?: string };
    }) => {
      const liveBroadcastContent = item.snippet?.liveBroadcastContent ?? "none";
      return (
        Boolean(item.id?.videoId) &&
        liveBroadcastContent !== "live" &&
        liveBroadcastContent !== "upcoming"
      );
    })
    .map((item: {
      id: { videoId: string };
      snippet: {
        title: string;
        publishedAt: string;
      };
    }) => ({
      id: item.id.videoId,
      title: item.snippet.title
        .replace(/&amp;/g, "&")
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">"),
      publishedAt: item.snippet.publishedAt,
      thumbnail: `https://i.ytimg.com/vi/${item.id.videoId}/hqdefault.jpg`,
    }))
    .slice(0, 3);
}

function parseRSSEntries(xml: string): YouTubeVideo[] {
  const entries: YouTubeVideo[] = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let m: RegExpExecArray | null;

  while ((m = entryRe.exec(xml)) !== null) {
    const block = m[1];
    const videoId = /<yt:videoId>([^<]+)<\/yt:videoId>/.exec(block)?.[1] ?? "";
    const rawTitle = /<title>([^<]*)<\/title>/.exec(block)?.[1] ?? "";
    const title = rawTitle
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"');
    const publishedAt = /<published>([^<]+)<\/published>/.exec(block)?.[1] ?? "";

    if (videoId) {
      entries.push({
        id: videoId,
        title,
        publishedAt,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      });
    }
  }

  return entries;
}

// Returns the set of video IDs (from the given list) that are livestreams.
// Costs 1 quota unit — safe to call even when search quota is exhausted.
async function fetchLiveVideoIds(ids: string[], apiKey: string): Promise<Set<string>> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${ids.join(",")}&key=${apiKey}`,
    { signal: AbortSignal.timeout(10_000) }
  );

  if (!res.ok) return new Set();

  consumeQuota(VIDEOS_COST);
  const data = (await res.json()) as { items?: Array<{ id?: string; liveStreamingDetails?: unknown }> };
  const liveIds = new Set<string>();

  for (const item of data.items ?? []) {
    if (item.id && item.liveStreamingDetails) {
      liveIds.add(item.id);
    }
  }

  return liveIds;
}

// RSS feeds include all uploads — regular videos and livestream replays alike.
// When an API key is available we do a cheap secondary call to keep only livestreams.
// When filtering isn't possible (no key, quota low, or API error) we fall back to
// returning all recent RSS entries rather than an empty list.
async function fetchViaRSS(apiKey?: string): Promise<YouTubeVideo[]> {
  const res = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
    { signal: AbortSignal.timeout(10_000) }
  );
  if (!res.ok) throw new Error(`RSS ${res.status}`);
  const xml = await res.text();
  // Fetch extra entries before filtering so we end up with ~3 livestreams after filtering
  const candidates = parseRSSEntries(xml).slice(0, 12);

  if (apiKey && candidates.length > 0 && isQuotaSafe(VIDEOS_COST)) {
    try {
      const liveIds = await fetchLiveVideoIds(candidates.map((v) => v.id), apiKey);
      if (liveIds.size > 0) {
        return candidates.filter((v) => liveIds.has(v.id)).slice(0, 3);
      }
    } catch {
      // fall through to unfiltered
    }
  }

  // No key, quota exhausted, or filter returned nothing — return recent entries as-is.
  // This channel primarily streams so the RSS list is usually correct anyway.
  return candidates.slice(0, 3);
}

export async function GET() {
  const now = Date.now();
  if (cached && now < cached.expiresAt) return Response.json({ videos: cached.videos });

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    let videos: YouTubeVideo[];

    if (apiKey && isQuotaSafe(SEARCH_COST)) {
      const result = await fetchViaApi(apiKey);
      videos = result === "QUOTA_EXCEEDED" ? await fetchViaRSS(apiKey) : result;
    } else {
      videos = await fetchViaRSS(apiKey);
    }

    cached = { videos, expiresAt: now + CACHE_TTL_MS };
    return Response.json({ videos });
  } catch {
    cached = { videos: [], expiresAt: now + 30_000 };
    return Response.json({ videos: [] });
  }
}
