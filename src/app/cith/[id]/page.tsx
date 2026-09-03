import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { cith } from "@/lib/api";
import HubDetailPageClient from "./HubDetailPageClient";

type Props = { params: Promise<{ id: string }> };

function locationOf(hub: any): string {
  if (hub.location) return hub.location;
  return [hub.area, hub.city, hub.state].filter(Boolean).join(", ") || "Location TBD";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const hub = await cith.getHub(id).catch(() => null);

  if (!hub?.name) {
    return buildMetadata({
      title: "CITH Hub",
      description: "Find a Church-in-the-House hub near you.",
      path: `/cith/${id}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: hub.name,
    description: hub.description || `A Church-in-the-House hub in ${locationOf(hub)}.`,
    path: `/cith/${id}`,
  });
}

export default async function HubDetailPage({ params }: Props) {
  const { id } = await params;
  const hub = await cith.getHub(id).catch(() => null);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "CITH", href: "/cith" },
          { label: hub?.name || "Hub" },
        ]}
      />
      <HubDetailPageClient params={params} />
    </>
  );
}
