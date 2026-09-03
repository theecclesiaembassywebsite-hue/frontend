import { ImageResponse } from "next/og";
import { buildOgImageElement, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

export const alt = "Give — The Ecclesia Embassy";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const element = await buildOgImageElement({
    eyebrow: "Give / Sow",
    title: "Your generosity fuels the Kingdom.",
  });

  return new ImageResponse(element, size);
}
