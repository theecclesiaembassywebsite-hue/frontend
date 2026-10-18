import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

// On-demand refresh for server-rendered public data. Call after an admin edit
// (e.g. the backend, on a schedule/announcement write) so the change shows
// immediately instead of waiting out the time-based revalidate window:
//   POST /api/revalidate  { "tags": ["service-schedule"] }
//   Authorization: Bearer $REVALIDATE_SECRET
const ALLOWED_TAGS = new Set(["service-schedule", "announcements"]);

const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

export async function POST(request: Request) {
  // Trimmed: a secret piped in through a shell can carry a trailing newline.
  const secret = process.env.REVALIDATE_SECRET?.trim();
  const provided = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!secret || !safeEqual(provided, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { tags?: unknown };
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t): t is string => typeof t === "string" && ALLOWED_TAGS.has(t))
    : [];
  if (tags.length === 0) {
    return NextResponse.json({ error: "No valid tags" }, { status: 400 });
  }

  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ revalidated: tags });
}
