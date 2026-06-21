const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function GET() {
  try {
    const response = await fetch(`${BASE_URL}/sermons/video`, {
      cache: "no-store",
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      return Response.json({ videos: [] });
    }

    const payload = (await response.json().catch(() => [])) as
      | Array<Record<string, unknown>>
      | { videos?: Array<Record<string, unknown>> };

    const videos = Array.isArray(payload)
      ? payload
      : Array.isArray(payload.videos)
        ? payload.videos
        : [];

    return Response.json({ videos });
  } catch {
    return Response.json({ videos: [] });
  }
}
