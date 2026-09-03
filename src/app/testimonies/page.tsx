import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TestimoniesPageClient from "./TestimoniesPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Testimonies",
  description:
    "Share your testimony and celebrate what God has done in and through The Ecclesia Embassy community.",
  path: "/testimonies",
});

export default function TestimoniesPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Testimonies" }]} />
      <TestimoniesPageClient />
    </>
  );
}
