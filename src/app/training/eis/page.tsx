import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import EISPageClient from "./EISPageClient";

export const metadata: Metadata = buildMetadata({
  title: "EIS — Ecclesia International School",
  description:
    "A learning environment where academic excellence meets spiritual intentionality, helping children grow with clarity, confidence, and kingdom values.",
  path: "/training/eis",
});

export default function EISPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Training", href: "/training" }, { label: "EIS" }]} />
      <EISPageClient />
    </>
  );
}
