import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TEMAPageClient from "./TEMAPageClient";

export const metadata: Metadata = buildMetadata({
  title: "TEMA Academy",
  description:
    "Where Spirit-led musicians are made — training that shapes students inside and out, not just teaches them.",
  path: "/training/tema",
});

export default function TEMAPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Training", href: "/training" }, { label: "TEMA" }]} />
      <TEMAPageClient />
    </>
  );
}
