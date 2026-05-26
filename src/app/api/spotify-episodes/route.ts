import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

// Maps Spotify show IDs to public Anchor RSS feeds
const RSS_FEEDS: Record<string, string> = {
  "38f94eSitKoPzXLUunJRV4": "https://anchor.fm/s/d9609fa8/podcast/rss",
  "1hiBj66Ggd8GvfQVV9aQRC": "https://anchor.fm/s/e76adfc8/podcast/rss",
};

function extractTag(block: string, tag: string): string {
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i").exec(block);
  if (cdata) return cdata[1].trim();
  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(block);
  return plain ? plain[1].trim() : "";
}

function extractAttr(block: string, tag: string, attr: string): string {
  const match = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, "i").exec(block);
  return match ? match[1].trim() : "";
}

function formatDuration(raw: string): string {
  if (!raw) return "";
  // Already in mm:ss or hh:mm:ss
  if (raw.includes(":")) {
    const parts = raw.split(":").map(Number);
    if (parts.length === 3) {
      const [h, m] = parts;
      return h > 0 ? `${h}h ${m}m` : `${parts[1]}m`;
    }
    return `${parts[0]}m`;
  }
  // Seconds as plain number
  const secs = parseInt(raw, 10);
  if (isNaN(secs)) return raw;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export async function GET(req: NextRequest) {
  const showId = req.nextUrl.searchParams.get("showId");
  if (!showId) {
    return NextResponse.json({ error: "showId is required" }, { status: 400 });
  }

  const feedUrl = RSS_FEEDS[showId];
  if (!feedUrl) {
    return NextResponse.json({ error: "Unknown show ID", episodes: [] }, { status: 404 });
  }

  try {
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": "EcclesiaEmbassy/1.0" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);

    const xml = await res.text();

    // Extract up to 3 <item> blocks
    const itemPattern = /<item[\s>]([\s\S]*?)<\/item>/gi;
    const episodes: object[] = [];
    let match: RegExpExecArray | null;

    while ((match = itemPattern.exec(xml)) !== null && episodes.length < 3) {
      const block = match[1];

      const title = extractTag(block, "title");
      const pubDate = extractTag(block, "pubDate");
      const duration = formatDuration(extractTag(block, "itunes:duration"));

      // Episode image: itunes:image href only (enclosure is audio, not image)
      const imageRaw = extractAttr(block, "itunes:image", "href") || null;
      const image = imageRaw?.match(/\.(jpg|jpeg|png|webp)/i) ? imageRaw : null;

      // Audio URL from enclosure (the actual mp3/audio file)
      const enclosureUrl = extractAttr(block, "enclosure", "url") || null;
      const enclosureType = extractAttr(block, "enclosure", "type") || "";
      const audioUrl =
        enclosureUrl && (enclosureType.startsWith("audio/") || enclosureUrl.match(/\.(mp3|m4a|ogg|wav)/i))
          ? enclosureUrl
          : null;

      // Prefer a Spotify link, otherwise the guid/link
      const guid = extractTag(block, "guid");
      const link = extractTag(block, "link");
      const spotifyUrl =
        (guid.startsWith("https://") ? guid : "") ||
        (link.startsWith("https://") ? link : "") ||
        `https://open.spotify.com/show/${showId}`;

      // Parse and normalise the date
      const parsed = pubDate ? new Date(pubDate) : null;
      const releaseDate =
        parsed && !isNaN(parsed.getTime())
          ? parsed.toISOString().split("T")[0]
          : pubDate;

      episodes.push({
        id: guid || `${showId}-${episodes.length}`,
        name: title,
        releaseDate,
        duration,
        image,
        audioUrl,
        spotifyUrl,
      });
    }

    return NextResponse.json({ episodes });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch episodes";
    return NextResponse.json({ error: message, episodes: [] }, { status: 500 });
  }
}
