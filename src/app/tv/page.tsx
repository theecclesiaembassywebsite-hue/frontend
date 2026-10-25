import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import TvPageClient from "./TvPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Ecclesia TV",
  description:
    "Ecclesia TV carries The Ecclesia Embassy's services live and our programmes the rest of the time.",
  path: "/tv",
});

export default function TvPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Ecclesia TV" }]} />
      <TvPageClient />
    </>
  );
}
