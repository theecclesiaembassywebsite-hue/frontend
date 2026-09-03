import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EcclesiaLibraryPageClient from "./EcclesiaLibraryPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Resource Library",
  description:
    "Search by title or author, or narrow the shelf down to a single kind of resource in The Ecclesia Embassy's library.",
  path: "/resources/library",
});

export default function EcclesiaLibraryPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Resources", href: "/resources" }, { label: "Library" }]} />
      <EcclesiaLibraryPageClient />
    </>
  );
}
