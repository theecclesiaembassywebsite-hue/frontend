import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import RadioPageClient from "./RadioPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Ecclesia Radio",
  description:
    "Ecclesia Radio plays worship, teaching and prayer from The Ecclesia Embassy around the clock.",
  path: "/radio",
});

export default function RadioPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Ecclesia Radio" }]} />
      <RadioPageClient />
    </>
  );
}
