import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import KISOLAMPageClient from "./KISOLAMPageClient";

export const metadata: Metadata = buildMetadata({
  title: "KISOLAM — Kingdom International School of Life and Ministry",
  description:
    "Equipping kingdom citizens for life, leadership, and ministry through structured training, doctrinal depth, and apostolic impartation.",
  path: "/training/kisolam",
});

export default function KISOLAMPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Training", href: "/training" }, { label: "KISOLAM" }]} />
      <KISOLAMPageClient />
    </>
  );
}
