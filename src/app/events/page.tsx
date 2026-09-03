import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import EventsPageClient from "./EventsPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Events & Programs",
  description:
    "Browse The Ecclesia Embassy's calendar month by month, including the annual Feast of Tabernacles and the Gilgal camp meeting.",
  path: "/events",
});

export default function EventsPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Events" }]} />
      <EventsPageClient />
    </>
  );
}
