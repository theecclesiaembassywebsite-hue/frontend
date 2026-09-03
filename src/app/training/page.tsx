import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionHeading from "@/components/ui/SectionHeading";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Training",
  description:
    "Intentional training for serious believers — courses and tracks that deepen conviction, discipline, and ministry readiness.",
  path: "/training",
});

const trainingTracks = [
  {
    logoSrc: "/tema-academy-logo-card.png",
    title: "TEMA Academy",
    description: "Structured ministerial training for believers being sharpened in doctrine, character, and apostolic weight.",
    href: "/training/tema",
  },
  {
    logoSrc: "/kisolam-logo.png",
    title: "KISOLAM",
    description: "Leadership and ministerial development for those growing in responsibility, clarity, and kingdom influence.",
    href: "/training/kisolam",
  },
  {
    logoSrc: "/eis-logo.png",
    title: "EIS",
    description: "Specialized training experiences designed to equip believers for practical service and deeper discipleship.",
    href: "/training/eis",
  },
];

export default function TrainingPage() {
  return (
    <main className="page-bands">
      <Breadcrumbs items={[{ label: "Training" }]} />
      <PageHero
        eyebrow="Training"
        title="Intentional training for serious believers."
        subtitle="Courses and tracks that deepen conviction, discipline, and ministry readiness."
        description="Training at the Embassy is not information for its own sake. It is designed to form people who can rightly divide truth, serve faithfully, and carry Kingdom responsibility with maturity."
        backgroundImage="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1920&q=80"
        compact
      />

      <SectionWrapper variant="white">
        <SectionHeading
          eyebrow="Training Tracks"
          title="Step into the path that fits your next season."
          description="Each track is built to serve a different layer of growth, from foundation to leadership development."
          className="mb-12"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {trainingTracks.map((track) => (
            <Link
              key={track.href}
              href={track.href}
              className="group soft-card rounded-[30px] p-7 transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex h-28 items-center justify-center">
                <Image
                  src={track.logoSrc}
                  alt={`${track.title} logo`}
                  width={220}
                  height={112}
                  className="h-full w-auto max-w-[220px] object-contain"
                />
              </div>
              <h2 className="mt-6 font-heading text-2xl font-bold text-slate">{track.title}</h2>
              <p className="mt-3 text-sm leading-7 text-gray-text">{track.description}</p>
              <div className="mt-6 flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-[0.22em] text-purple-vivid">
                Explore Track
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </SectionWrapper>
    </main>
  );
}
