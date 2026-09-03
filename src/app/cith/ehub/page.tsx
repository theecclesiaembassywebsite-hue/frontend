import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EHubPageClient from "./EHubPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Join the e-Hub",
  description:
    "Connect with The Ecclesia Embassy from anywhere in the world through the e-Hub.",
  path: "/cith/ehub",
});

export default function EHubPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "CITH", href: "/cith" }, { label: "e-Hub" }]} />
      <EHubPageClient />
    </>
  );
}
