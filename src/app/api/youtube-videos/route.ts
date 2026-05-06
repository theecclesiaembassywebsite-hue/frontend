const FEED_URL =
  "https://www.youtube.com/feeds/videos.xml?channel_id=UCrvZyTocoH926b_wv81bpzA";

interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
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
    const publishedAt =
      /<published>([^<]+)<\/published>/.exec(block)?.[1] ?? "";

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

export async function GET() {
  try {
    const res = await fetch(FEED_URL, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`);
    const xml = await res.text();
    const videos = parseRSSEntries(xml).slice(0, 6);
    return Response.json({ videos });
  } catch {
    return Response.json({ videos: [] });
  }
}
