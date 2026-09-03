import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import NewHerePageClient from "./NewHerePageClient";

export const metadata: Metadata = buildMetadata({
  title: "New Here?",
  description:
    "Whether it's your first Sunday in person or your first step into our global faith community, let us know you're coming and we'll be ready for you.",
  path: "/new-here",
});

export default function NewHerePage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "New Here" }]} />
      <NewHerePageClient />
    </>
  );
}
