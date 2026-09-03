import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import GivePageClient from "./GivePageClient";

export const metadata: Metadata = buildMetadata({
  title: "Give",
  description:
    "Give what the Lord has put in your heart — every gift sown at The Ecclesia Embassy is an act of worship and Kingdom partnership.",
  path: "/give",
});

export default function GivePage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Give" }]} />
      <GivePageClient />
    </>
  );
}
