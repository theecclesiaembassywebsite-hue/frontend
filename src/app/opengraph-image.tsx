import { ImageResponse } from "next/og";
import { buildOgImageElement, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

export const alt = "The Ecclesia Embassy";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const element = await buildOgImageElement({
    eyebrow: "Welcome Home",
    title: "A House for Worship, the Word, and Kingdom Life.",
  });

  return new ImageResponse(element, size);
}
