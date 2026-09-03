import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CommunityPageClient from "./CommunityPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Community",
  description: "Connect, share, and grow with The Ecclesia Embassy community.",
  path: "/community",
});

export default function CommunityPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Community" }]} />
      <CommunityPageClient />
    </>
  );
}
