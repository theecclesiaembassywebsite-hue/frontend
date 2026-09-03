import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import VideoMessagesPageClient from "./VideoMessagesPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Video Messages",
  description: "Watch teachings and messages from The Ecclesia Embassy again, on demand.",
  path: "/resources/video",
});

export default function VideoMessagesPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Resources", href: "/resources" }, { label: "Video Messages" }]} />
      <VideoMessagesPageClient />
    </>
  );
}
