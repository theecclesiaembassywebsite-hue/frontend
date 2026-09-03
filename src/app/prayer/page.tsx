import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PrayerPageClient from "./PrayerPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Prayer Request",
  description:
    "Submit a prayer request and stand with The Ecclesia Embassy community in prayer.",
  path: "/prayer",
});

export default function PrayerPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Prayer" }]} />
      <PrayerPageClient />
    </>
  );
}
