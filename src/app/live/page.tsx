import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import LivePageClient from "./LivePageClient";

export const metadata: Metadata = buildMetadata({
  title: "Watch Live",
  description: "Watch The Ecclesia Embassy's current or most recent livestream service.",
  path: "/live",
});

export default function LivePage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Live" }]} />
      <LivePageClient />
    </>
  );
}
