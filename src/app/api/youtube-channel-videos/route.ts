import { consumeQuota, isQuotaSafe } from "@/lib/youtube-quota";

const CHANNEL_ID = "UCrvZyTocoH926b_wv81bpzA";
const CHANNEL_VIDEOS_URL =
  "https://www.youtube.com/@TheEcclesiaEmbassy/videos?ucbcb=1&has_verified=1&bpctr=9999999999";
const CACHE_TTL_MS = 15 * 60_000;
const VIDEOS_COST = 1;

interface ChannelVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  watchUrl: string;
}

interface PlaylistItem {
  id?: string;
  snippet?: {
    title?: string;
    publishedAt?: string;
    thumbnails?: {
      default?: { url?: string };
      medium?: { url?: string };
      high?: { url?: string };
      standard?: { url?: string };
      maxres?: { url?: string };
    };
  };
  contentDetails?: {
    videoId?: string;
    videoPublishedAt?: string;
  };
}

let cached: { videos: ChannelVideo[]; expiresAt: number } | null = null;

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function resolveThumbnail(
  id: string,
  thumbnails?: PlaylistItem["snippet"]["thumbnails"]
) {
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  );
}

function normalizeVideo(
  id: string,
  title: string,
  publishedAt: string,
  thumbnail?: string
): ChannelVideo {
  return {
    id,
    title: decodeEntities(title),
    publishedAt,
    thumbnail: thumbnail ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    watchUrl: `https://www.youtube.com/watch?v=${id}`,
  };
}

function extractVideosTabIds(html: string) {
  const matches = html.matchAll(/"videoId":"([^"]+)"/g);
  const ids = new Set<string>();

  for (const match of matches) {
    const id = match[1];

    if (id) {
      ids.add(id);
    }

    if (ids.size >= 24) {
      break;
    }
  }

  return Array.from(ids);
}

async function fetchVideosTabIds() {
  const response = await fetch(CHANNEL_VIDEOS_URL, {
    headers: {
      "accept-language": "en-US,en;q=0.9",
      cookie: "CONSENT=YES+cb",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`VIDEOS_TAB ${response.status}`);
  }

  const html = await response.text();
  const ids = extractVideosTabIds(html);

  if (ids.length === 0) {
    throw new Error("VIDEOS_TAB_EMPTY");
  }

  return ids;
}

async function fetchVideosTabViaApi(apiKey: string) {
  const ids = await fetchVideosTabIds();
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ids.join(",")}&key=${apiKey}`,
    { signal: AbortSignal.timeout(10_000) }
  );

  if (!response.ok) {
    throw new Error(`VIDEOS ${response.status}`);
  }

  consumeQuota(VIDEOS_COST);
  const data = await response.json();
  const videosById = new Map<string, PlaylistItem>();

  ((data.items ?? []) as PlaylistItem[]).forEach((item) => {
    const id = item.contentDetails?.videoId ?? item.id;

    if (id) {
      videosById.set(id, item);
    }
  });

  return ids
    .map((id) => {
      const item = videosById.get(id);

      if (!item) {
        return null;
      }

      return normalizeVideo(
        id,
        item.snippet?.title ?? "YouTube Upload",
        item.snippet?.publishedAt ?? item.contentDetails?.videoPublishedAt ?? "",
        resolveThumbnail(id, item.snippet?.thumbnails)
      );
    })
    .filter((video): video is ChannelVideo => Boolean(video))
    .slice(0, 12);
}

function parseFeed(xml: string) {
  const videos: ChannelVideo[] = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let match: RegExpExecArray | null;

  while ((match = entryRe.exec(xml)) !== null) {
    const entry = match[1];
    const id = /<yt:videoId>([^<]+)<\/yt:videoId>/.exec(entry)?.[1] ?? "";
    const title = decodeEntities(/<title>([^<]*)<\/title>/.exec(entry)?.[1] ?? "");
    const publishedAt = /<published>([^<]+)<\/published>/.exec(entry)?.[1] ?? "";

    if (!id || !title) {
      continue;
    }

    videos.push(normalizeVideo(id, title, publishedAt));
  }

  return videos;
}

async function fetchUploadsViaRss() {
  const response = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
    { signal: AbortSignal.timeout(10_000) }
  );

  if (!response.ok) {
    throw new Error(`RSS ${response.status}`);
  }

  const xml = await response.text();
  return parseFeed(xml).slice(0, 12);
}

async function fetchChannelVideos() {
  const now = Date.now();

  if (cached && now < cached.expiresAt) {
    return cached.videos;
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  let videos: ChannelVideo[];

  if (apiKey && isQuotaSafe(VIDEOS_COST)) {
    try {
      videos = await fetchVideosTabViaApi(apiKey);
    } catch {
      videos = [];
    }
  } else {
    videos = await fetchUploadsViaRss();
  }

  cached = {
    videos,
    expiresAt: now + CACHE_TTL_MS,
  };

  return videos;
}

export async function GET() {
  try {
    const videos = await fetchChannelVideos();
    return Response.json({ videos });
  } catch {
    return Response.json({ videos: [] });
  }
}
