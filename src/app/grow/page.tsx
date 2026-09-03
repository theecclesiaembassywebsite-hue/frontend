import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import GrowPageClient from "./GrowPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Grow",
  description:
    "Whether new to The Ecclesia Embassy or ready for a deeper commitment, these pathways help you grow in faith and become a committed part of the community.",
  path: "/grow",
});

export default function GrowPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Grow" }]} />
      <GrowPageClient />
    </>
  );
}
