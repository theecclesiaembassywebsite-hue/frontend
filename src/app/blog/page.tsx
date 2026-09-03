import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BlogPageClient from "./BlogPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Blog & Insights",
  description: "Thoughts, teachings, and testimonials from The Ecclesia Embassy.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Blog" }]} />
      <BlogPageClient />
    </>
  );
}
