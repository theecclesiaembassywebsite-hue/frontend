import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { events } from "@/lib/api";
import EventDetailPageClient from "./EventDetailPageClient";

type Props = { params: Promise<{ slug: string }> };

function descriptionFrom(event: any): string {
  const text = String(event.description ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > 155 ? `${text.slice(0, 152)}...` : text || "An event hosted by The Ecclesia Embassy.";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await events.getEvent(slug).catch(() => null);

  if (!event?.title) {
    return buildMetadata({
      title: "Event",
      description: "Gatherings, feasts, and camp meetings at The Ecclesia Embassy.",
      path: `/events/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: event.title,
    description: descriptionFrom(event),
    path: `/events/${slug}`,
    ogImage: event.imageUrl,
  });
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await events.getEvent(slug).catch(() => null);

  const jsonLd = event?.title
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.title,
        description: descriptionFrom(event),
        startDate: event.date,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: event.location
          ? { "@type": "Place", name: event.location }
          : { "@type": "Place", name: "Abuja, Nigeria" },
        image: event.imageUrl ? [event.imageUrl] : undefined,
        organizer: { "@type": "Organization", name: "The Ecclesia Embassy", url: SITE_URL },
      }
    : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
           
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <Breadcrumbs
        items={[
          { label: "Events", href: "/events" },
          { label: event?.title || "Event" },
        ]}
      />
      <EventDetailPageClient params={params} />
    </>
  );
}
