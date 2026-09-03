import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ExperiencePageClient from "./ExperiencePageClient";

export const metadata: Metadata = buildMetadata({
  title: "The Ecclesia Experience",
  description:
    "Word, Warfare, and Worship held together — a nation with systems, language, and rhythms that help believers grow together.",
  path: "/about/experience",
});

export default function ExperiencePage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "About", href: "/about" }, { label: "The Ecclesia Experience" }]} />
      <ExperiencePageClient />
    </>
  );
}
