import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import GroupsPageClient from "./GroupsPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Community Groups",
  description:
    "Join squad-based and topic-based discussion groups within The Ecclesia Embassy community.",
  path: "/community/groups",
});

export default function GroupsPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Community", href: "/community" }, { label: "Groups" }]} />
      <GroupsPageClient />
    </>
  );
}
