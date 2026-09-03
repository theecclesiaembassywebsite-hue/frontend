import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { buttonClasses } from "@/components/ui/button-styles";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

const popularLinks = [
  { label: "Plan Your Visit", href: "/new-here" },
  { label: "Watch Live", href: "/live" },
  { label: "Upcoming Events", href: "/events" },
  { label: "Find a Hub", href: "/cith" },
];

export default function NotFound() {
  return (
    <>
      <PageHero
        eyebrow="404"
        title="This page has stepped out."
        description="The page you're looking for doesn't exist or may have moved. Here are a few places to pick back up."
        compact
      />
      <SectionWrapper>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <Link href="/" className={buttonClasses({ variant: "primary" })}>
            Back to Home
          </Link>
          <div className="flex flex-wrap justify-center gap-3">
            {popularLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={buttonClasses({ variant: "secondary" })}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
