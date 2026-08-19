// Fetches recent completed livestreams for YouTube channel
// @theecclesiaembassy (UCrvZyTocoH926b_wv81bpzA).
//
// Primary: the channel's uploads playlist (playlistItems.list) narrowed to
// livestreams via videos.list. We deliberately do NOT use search.list with
// eventType=completed: that endpoint reads YouTube's search index, which lags
// badly and silently omits recent streams. Observed 2026-08-19 — search
// returned 18 Aug, 12 Jul, 5 Jul while the channel had actually streamed on
// 18 Aug, 2 Aug, 26 Jul, 19 Jul. The uploads playlist is authoritative and
// costs 2 units per refresh instead of search.list's 100.
//
// Fallback: RSS feed — used only when no API key is configured.
import { isQuotaSafe, consumeQuota } from "@/lib/youtube-quota";

const CHANNEL_ID = "UCrvZyTocoH926b_wv81bpzA";
// A channel's uploads playlist is its ID with the "UC" prefix swapped for "UU".
const UPLOADS_PLAYLIST_ID = `UU${CHANNEL_ID.slice(2)}`;
const CACHE_TTL_MS = 60 * 60_000; // 1 hour
const PLAYLIST_COST = 1; // units per playlistItems.list call
const VIDEOS_COST = 1; // units per videos.list call
// The channel posts clips and shorts between services, so scan a wide window of
// uploads to be sure we still find 3 livestreams. videos.list accepts 50 IDs
// per call, so widening this does not add quota cost.
const UPLOAD_SCAN_SIZE = 30;
const WANTED = 3;

interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
}

let cached: { videos: YouTubeVideo[]; expiresAt: number } | null = null;

function decodeTitle(raw: string): string {
  return raw
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// Newest uploads first. Returns bare video IDs; liveness is resolved separately.
async function fetchRecentUploadIds(apiKey: string): Promise<string[]> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=${UPLOAD_SCAN_SIZE}&key=${apiKey}`,
    { signal: AbortSignal.timeout(10_000) }
  );

  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    const reason = body?.error?.errors?.[0]?.reason ?? "";
    if (reason === "quotaExceeded" || reason === "dailyLimitExceeded") {
      throw new Error("QUOTA_EXCEEDED");
    }
  }

  if (!res.ok) throw new Error(`playlistItems ${res.status}`);

  consumeQuota(PLAYLIST_COST);
  const data = (await res.json()) as {
    items?: Array<{ contentDetails?: { videoId?: string } }>;
  };

  return (data.items ?? [])
    .map((item) => item.contentDetails?.videoId)
    .filter((id): id is string => Boolean(id));
}

// Keeps only videos that were livestreams and have finished, newest first.
// A stream that is still running has actualStartTime but no actualEndTime, and
// an upcoming one has only scheduledStartTime — requiring actualEndTime excludes
// both, so the archive never shows the broadcast that is currently on air.
async function fetchCompletedStreams(
  ids: string[],
  apiKey: string
): Promise<YouTubeVideo[]> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${ids.join(",")}&key=${apiKey}`,
    { signal: AbortSignal.timeout(10_000) }
  );

  if (!res.ok) throw new Error(`videos ${res.status}`);

  consumeQuota(VIDEOS_COST);
  const data = (await res.json()) as {
    items?: Array<{
      id?: string;
      snippet?: { title?: string; publishedAt?: string };
      liveStreamingDetails?: { actualEndTime?: string };
    }>;
  };

  return (data.items ?? [])
    .filter((item) => Boolean(item.id) && Boolean(item.liveStreamingDetails?.actualEndTime))
    .map((item) => ({
      id: item.id as string,
      title: decodeTitle(item.snippet?.title ?? ""),
      // Prefer the broadcast end time — for a stream that is what "aired on"
      // means, and it can differ from publishedAt when the video was created
      // ahead of the service.
      publishedAt:
        item.liveStreamingDetails?.actualEndTime ?? item.snippet?.publishedAt ?? "",
      thumbnail: `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
    }))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, WANTED);
}

async function fetchViaApi(apiKey: string): Promise<YouTubeVideo[]> {
  const ids = await fetchRecentUploadIds(apiKey);
  if (ids.length === 0) return [];
  return fetchCompletedStreams(ids, apiKey);
}

function parseRSSEntries(xml: string): YouTubeVideo[] {
  const entries: YouTubeVideo[] = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let m: RegExpExecArray | null;

  while ((m = entryRe.exec(xml)) !== null) {
    const block = m[1];
    const videoId = /<yt:videoId>([^<]+)<\/yt:videoId>/.exec(block)?.[1] ?? "";
    const title = decodeTitle(/<title>([^<]*)<\/title>/.exec(block)?.[1] ?? "");
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

// Last resort when no API key is configured. RSS lists every upload with no way
// to tell streams from clips, and YouTube has been serving 404/500 for this
// channel's feed, so treat an empty result as normal rather than an error.
async function fetchViaRSS(): Promise<YouTubeVideo[]> {
  const res = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
    { signal: AbortSignal.timeout(10_000) }
  );
  if (!res.ok) return [];
  const xml = await res.text();
  return parseRSSEntries(xml).slice(0, WANTED);
}

export async function GET() {
  const now = Date.now();
  if (cached && now < cached.expiresAt) return Response.json({ videos: cached.videos });

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    let videos: YouTubeVideo[];

    if (apiKey && isQuotaSafe(PLAYLIST_COST + VIDEOS_COST)) {
      try {
        videos = await fetchViaApi(apiKey);
      } catch {
        videos = await fetchViaRSS();
      }
    } else {
      videos = await fetchViaRSS();
    }

    cached = { videos, expiresAt: now + CACHE_TTL_MS };
    return Response.json({ videos });
  } catch {
    cached = { videos: [], expiresAt: now + 30_000 };
    return Response.json({ videos: [] });
  }
}
