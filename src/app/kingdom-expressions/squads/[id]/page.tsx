import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { squads } from "@/lib/api";
import SquadDetailPageClient from "./SquadDetailPageClient";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const squad = await squads.getSquad(id).catch(() => null);

  if (!squad?.name) {
    return buildMetadata({
      title: "Kingdom Life Squad",
      description: "Find your place and serve with purpose at The Ecclesia Embassy.",
      path: `/kingdom-expressions/squads/${id}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: squad.name,
    description: squad.description || `A Kingdom Life Squad at The Ecclesia Embassy.`,
    path: `/kingdom-expressions/squads/${id}`,
  });
}

export default async function SquadDetailPage({ params }: Props) {
  const { id } = await params;
  const squad = await squads.getSquad(id).catch(() => null);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kingdom Expressions", href: "/kingdom-expressions" },
          { label: "Squads", href: "/kingdom-expressions/squads" },
          { label: squad?.name || "Squad" },
        ]}
      />
      <SquadDetailPageClient params={params} />
    </>
  );
}
