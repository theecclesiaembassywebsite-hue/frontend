import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CITHPageClient from "./CITHPageClient";

export const metadata: Metadata = buildMetadata({
  title: "CITH Hubs",
  description:
    "Search by location, area, or hub leader to find your Church-in-the-House hub and see when and where it meets.",
  path: "/cith",
});

export default function CITHPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "CITH" }]} />
      <CITHPageClient />
    </>
  );
}
