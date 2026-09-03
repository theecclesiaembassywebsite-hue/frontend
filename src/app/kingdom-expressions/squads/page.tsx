import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import SquadsPageClient from "./SquadsPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Kingdom Life Squads",
  description:
    "Find your place and serve with purpose — demonstrating the Scriptural lifestyle of the Kingdom of God, one need at a time.",
  path: "/kingdom-expressions/squads",
});

export default function SquadsPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ label: "Kingdom Expressions", href: "/kingdom-expressions" }, { label: "Squads" }]}
      />
      <SquadsPageClient />
    </>
  );
}
