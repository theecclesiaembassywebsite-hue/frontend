import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import KIPPageClient from "./KIPPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Kingdom Influencing Platform (KIP)",
  description:
    "Raising Kingdom voices, shaping systems, and advancing God's agenda through equipped Kingdom ambassadors.",
  path: "/kingdom-expressions/kip",
});

export default function KIPPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ label: "Kingdom Expressions", href: "/kingdom-expressions" }, { label: "KIP" }]}
      />
      <KIPPageClient />
    </>
  );
}
