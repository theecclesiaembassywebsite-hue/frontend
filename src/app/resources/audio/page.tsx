import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import AudioArchivePageClient from "./AudioArchivePageClient";

export const metadata: Metadata = buildMetadata({
  title: "Audio Archive",
  description:
    "Stream past messages and teachings, or follow The Ecclesia Embassy podcast on Spotify and take it with you.",
  path: "/resources/audio",
});

export default function AudioArchivePage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Resources", href: "/resources" }, { label: "Audio Archive" }]} />
      <AudioArchivePageClient />
    </>
  );
}
