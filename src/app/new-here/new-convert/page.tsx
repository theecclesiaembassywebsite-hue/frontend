import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import NewConvertPageClient from "./NewConvertPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Welcome to the Family",
  description:
    "A welcome for new converts stepping into faith and into life at The Ecclesia Embassy.",
  path: "/new-here/new-convert",
});

export default function NewConvertPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "New Here", href: "/new-here" }, { label: "New Convert" }]} />
      <NewConvertPageClient />
    </>
  );
}
