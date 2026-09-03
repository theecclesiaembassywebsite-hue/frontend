import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EcclesiaMusicPageClient from "./EcclesiaMusicPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Ecclesia Music",
  description: "Worship in spirit and truth — stream music from The Ecclesia Embassy.",
  path: "/resources/music",
});

export default function EcclesiaMusicPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Resources", href: "/resources" }, { label: "Music" }]} />
      <EcclesiaMusicPageClient />
    </>
  );
}
