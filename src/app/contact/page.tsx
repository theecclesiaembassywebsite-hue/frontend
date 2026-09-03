import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us",
  description:
    "Reach The Ecclesia Embassy for prayer, questions, or to connect from anywhere in the world — our team will get back to you shortly.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <ContactPageClient />
    </>
  );
}
