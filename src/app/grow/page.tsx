"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Music, Users } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionHeading from "@/components/ui/SectionHeading";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/Motion";
import { buttonClasses } from "@/components/ui/button-styles";

const growthPaths = [
  {
    icon: GraduationCap,
    title: "Intentionality Class",
    desc: "A foundational training track to deepen understanding in the word and become an active member of The Ecclesia Embassy.",
    href: "/grow/intentionality-class",
  },
  {
    icon: Users,
    title: "Church in the House",
    desc: "Find a hub fellowship in your neighbourhood, grow in the word and build intentional community.",
    href: "/cith",
  },
  {
    icon: BookOpen,
    title: "Kingdom Life Squads",
    desc: "Our life in the Kingdom is lived out in service. Join a squad and commit to Kingdom service across various areas.",
    href: "/kingdom-expressions/squads",
  },
  {
    icon: Music,
    title: "Ecclesia Music",
    desc: "Listen to music birthed from the word of God and build your faith.",
    href: "/resources/music",
  },
];

export default function GrowPage() {
  return (
    <main className="page-bands">
      <PageHero
        eyebrow="Grow"
        title="Take your next intentional step with us."
        description="Whether you are new to The Ecclesia Embassy or ready for a deeper commitment, these pathways help you grow in your faith and be a committed part of this community."
        actions={[
          { href: "/new-here", label: "Start Here", variant: "primary" },
          { href: "/cith", label: "Find Community", variant: "secondary", onDark: true },
        ]}
        compact
      />

      <SectionWrapper variant="white">
        <SectionHeading
          eyebrow="Growth Pathways"
          title="Choose the path that matches your next step with us."
          description="At The Ecclesia Embassy, growth is practical through classes, hub meetings and an intentional community."
          className="mb-12"
        />

        <StaggerContainer>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {growthPaths.map((path) => {
              const Icon = path.icon;

              return (
                <StaggerItem key={path.title}>
                  <Link
                    href={path.href}
                    className="group soft-card block rounded-[30px] p-8 transition-transform duration-200 hover:-translate-y-1"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-light text-purple-vivid">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 font-heading text-2xl font-bold text-slate">{path.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-gray-text">{path.desc}</p>
                    <div className="mt-6 flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-[0.22em] text-purple-vivid">
                      Learn More
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </div>
        </StaggerContainer>
      </SectionWrapper>

      <SectionWrapper variant="dark-purple">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <SectionHeading
              eyebrow="Ready?"
              title="Let Sunday become the start of a deeper rhythm."
              description="Join us in person, meet the people of the house, and start building the kind of habits that sustain long-term growth."
              align="center"
              className="mx-auto"
              titleClassName="text-white"
            />
            <Link
              href="/new-here"
              className={buttonClasses({ variant: "primary", className: "mt-8" })}
            >
              Plan Your Visit
            </Link>
          </div>
        </FadeIn>
      </SectionWrapper>
    </main>
  );
}
