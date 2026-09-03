import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import GilgalPageClient from "./GilgalPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Gilgal Camp Meeting",
  description:
    "A prophetic gathering programmed by God to deliver to every partaker the dividends of camping alone with Him. June 5–8, 2026.",
  path: "/events/gilgal",
});

// Venue isn't named on the page beyond "hosted in Abuja" — city-level
// location rather than a specific street address, so nothing is invented.
const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Gilgal Camp Meeting",
  startDate: "2026-06-05",
  endDate: "2026-06-08",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: {
    "@type": "Place",
    name: "Abuja, Nigeria",
    address: { "@type": "PostalAddress", addressLocality: "Abuja", addressCountry: "NG" },
  },
  organizer: { "@type": "Organization", name: "The Ecclesia Embassy", url: SITE_URL },
  description:
    "A prophetic gathering programmed by God to deliver to every partaker the dividends of camping alone with Him. Free, with accommodation and meals included.",
};

export default function GilgalPage() {
  return (
    <>
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <Breadcrumbs items={[{ label: "Events", href: "/events" }, { label: "Gilgal Camp Meeting" }]} />
      <GilgalPageClient />
    </>
  );
}
