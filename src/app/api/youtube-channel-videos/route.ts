import { consumeQuota, isQuotaSafe } from "@/lib/youtube-quota";

const CHANNEL_ID = "UCrvZyTocoH926b_wv81bpzA";
const CACHE_TTL_MS = 15 * 60_000;
const CHANNELS_COST = 1;
const PLAYLIST_ITEMS_COST = 1;
const VIDEOS_COST = 1;

interface ChannelVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  watchUrl: string;
}

interface PlaylistItem {
  snippet?: {
    title?: string;
    publishedAt?: string;
    liveBroadcastContent?: string;
  };
  contentDetails?: {
    videoId?: string;
    videoPublishedAt?: string;
  };
}

interface VideoDetailsItem {
  id?: string;
  liveStreamingDetails?: Record<string, unknown>;
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

function normalizeVideo(id: string, title: string, publishedAt: string): ChannelVideo {
  return {
    id,
    title: decodeEntities(title),
    publishedAt,
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    watchUrl: `https://www.youtube.com/watch?v=${id}`,
  };
}

async function fetchUploadsViaApi(apiKey: string) {
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${apiKey}`,
    { signal: AbortSignal.timeout(10_000) }
  );

  if (!channelResponse.ok) {
    throw new Error(`CHANNELS ${channelResponse.status}`);
  }

  consumeQuota(CHANNELS_COST);
  const channelData = await channelResponse.json();
  const uploadsPlaylistId =
    channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? "";

  if (!uploadsPlaylistId) {
    return [];
  }

  const playlistResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=24&key=${apiKey}`,
    { signal: AbortSignal.timeout(10_000) }
  );

  if (!playlistResponse.ok) {
    throw new Error(`PLAYLIST_ITEMS ${playlistResponse.status}`);
  }

  consumeQuota(PLAYLIST_ITEMS_COST);
  const playlistData = await playlistResponse.json();
  const playlistItems: PlaylistItem[] = playlistData.items ?? [];
  const candidateIds = playlistItems
    .map((item) => item.contentDetails?.videoId)
    .filter((id): id is string => Boolean(id));

  if (candidateIds.length === 0) {
    return [];
  }

  const videosResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${candidateIds.join(",")}&key=${apiKey}`,
    { signal: AbortSignal.timeout(10_000) }
  );

  if (!videosResponse.ok) {
    throw new Error(`VIDEOS ${videosResponse.status}`);
  }

  consumeQuota(VIDEOS_COST);
  const videosData = await videosResponse.json();
  const livestreamIds = new Set(
    ((videosData.items ?? []) as VideoDetailsItem[])
      .filter((item) => item.id && item.liveStreamingDetails)
      .map((item) => item.id as string)
  );

  return playlistItems
    .filter((item) => {
      const id = item.contentDetails?.videoId;
      const liveBroadcastContent = item.snippet?.liveBroadcastContent ?? "none";

      if (!id) {
        return false;
      }

      return (
        liveBroadcastContent === "none" &&
        !livestreamIds.has(id)
      );
    })
    .map((item) =>
      normalizeVideo(
        item.contentDetails?.videoId ?? "",
        item.snippet?.title ?? "YouTube Upload",
        item.snippet?.publishedAt ?? item.contentDetails?.videoPublishedAt ?? ""
      )
    )
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

  if (apiKey && isQuotaSafe(CHANNELS_COST + PLAYLIST_ITEMS_COST + VIDEOS_COST)) {
    try {
      videos = await fetchUploadsViaApi(apiKey);
    } catch {
      videos = await fetchUploadsViaRss();
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
