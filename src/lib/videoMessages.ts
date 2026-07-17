export interface ChannelVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  watchUrl: string;
}

export interface VideoMessage extends ChannelVideo {
  sourceLabel: string;
  description?: string;
}

export function extractYoutubeId(url?: string) {
  if (!url) return "";

  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#/]+)/
  );

  return match?.[1] ?? "";
}

/**
 * Fetches and merges YouTube channel uploads with manually-curated video
 * entries, sorted newest-first. Mirrors the list shown on /resources/video.
 */
export async function fetchVideoMessages(): Promise<VideoMessage[]> {
  const [channelResult, manualResult] = await Promise.allSettled([
    fetch("/api/youtube-channel-videos"),
    fetch("/api/sermons/video"),
  ]);

  const channelVideos: ChannelVideo[] =
    channelResult.status === "fulfilled"
      ? ((await channelResult.value.json().catch(() => ({}))).videos ?? [])
      : [];

  const manualPayload: unknown =
    manualResult.status === "fulfilled"
      ? await manualResult.value.json().catch(() => [])
      : [];

  const manualEntries: Array<Record<string, unknown>> = Array.isArray(manualPayload)
    ? manualPayload
    : Array.isArray((manualPayload as { videos?: unknown }).videos)
      ? (manualPayload as { videos: Array<Record<string, unknown>> }).videos
      : [];

  // Base: channel uploads (non-livestream) from both channels
  const merged = new Map<string, VideoMessage>();
  channelVideos.forEach((v) => {
    merged.set(v.id, { ...v, sourceLabel: "YouTube Upload" });
  });

  manualEntries.forEach((entry) => {
    const youtubeUrl =
      typeof entry.youtubeUrl === "string" ? entry.youtubeUrl : "";
    const videoId = extractYoutubeId(youtubeUrl);
    if (!videoId) return;

    const speaker =
      typeof entry.speaker === "string" && entry.speaker.trim()
        ? entry.speaker
        : "Manual Entry";
    const description =
      typeof entry.description === "string" ? entry.description : undefined;
    const manualTitle =
      typeof entry.title === "string" && entry.title.trim()
        ? entry.title
        : "Video Message";

    const existing = merged.get(videoId);
    merged.set(videoId, {
      id: typeof entry.id === "string" ? entry.id : videoId,
      title: existing?.title ?? manualTitle,
      publishedAt:
        existing?.publishedAt ??
        (typeof entry.createdAt === "string"
          ? entry.createdAt
          : typeof entry.date === "string"
            ? entry.date
            : ""),
      thumbnail:
        existing?.thumbnail ??
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      watchUrl: youtubeUrl,
      sourceLabel: speaker,
      description,
    });
  });

  return Array.from(merged.values()).sort(
    (a, b) =>
      new Date(b.publishedAt || 0).getTime() -
      new Date(a.publishedAt || 0).getTime()
  );
}
