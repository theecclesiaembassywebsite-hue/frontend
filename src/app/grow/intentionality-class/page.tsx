import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import IntentionalityClassPageClient from "./IntentionalityClassPageClient";

export const metadata: Metadata = buildMetadata({
  title: "The Intentionality Class",
  description:
    "A step-by-step journey that helps believers grow in faith, align with culture, and mature into service, stewardship, and leadership.",
  path: "/grow/intentionality-class",
});

export default function IntentionalityClassPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Grow", href: "/grow" }, { label: "Intentionality Class" }]} />
      <IntentionalityClassPageClient />
    </>
  );
}
