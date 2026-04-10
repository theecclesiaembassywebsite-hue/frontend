"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Button from "@/components/ui/Button";
import { FadeIn, StaggerContainer, StaggerItem, HoverLift } from "@/components/ui/Motion";
import Link from "next/link";
import { GraduationCap, BookOpen, Users, Music, ArrowRight } from "lucide-react";

const growthPaths = [
  {
    icon: GraduationCap,
    title: "Intentionality Class",
    desc: "A 6-week foundational course designed to deepen your understanding of faith and prepare you for active ministry.",
    href: "/grow/intentionality-class",
  },
  {
    icon: Users,
    title: "Church in the House",
    desc: "Join a local fellowship group to build meaningful relationships and grow spiritually within your community.",
    href: "/cith",
  },
  {
    icon: BookOpen,
    title: "Kingdom Life Squads",
    desc: "Serve in a ministry team that aligns with your gifts and calling while impacting the kingdom.",
    href: "/kingdom/squads",
  },
  {
    icon: Music,
    title: "Ecclesia Music",
    desc: "Express your worship through music and be part of our vibrant worship and creative community.",
    href: "/resources/music",
  },
];

export default function GrowPage() {
  return (
    <>
      {/* Hero Section */}
      <section
        className="relative flex items-center justify-center py-24 md:py-32 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <FadeIn>
            <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">
              Grow with Us
            </h1>
            <p className="mt-4 font-serif text-lg text-off-white">
              Deepen your walk, develop your gifts
            </p>
            <div className="mt-6 w-12 h-1 bg-purple-vivid mx-auto" />
          </FadeIn>
        </div>
      </section>

      {/* Growth Paths Section */}
      <SectionWrapper variant="white">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-slate mb-4">
            Your Growth Journey
          </h2>
          <p className="text-gray-text max-w-2xl mx-auto">
            At The Ecclesia Embassy, we believe in intentional growth. Choose a
            path that aligns with your calling and begin your next chapter.
          </p>
        </div>

        <StaggerContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {growthPaths.map((path, index) => {
              const Icon = path.icon;
              return (
                <StaggerItem key={path.title}>
                  <HoverLift>
                    <Link href={path.href}>
                      <div className="border border-gray-border rounded-xl p-8 h-full bg-white hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple/20">
                            <Icon className="h-6 w-6 text-purple" />
                          </div>
                        </div>
                        <h3 className="font-heading text-xl font-bold text-slate mb-2">
                          {path.title}
                        </h3>
                        <p className="text-gray-text text-sm mb-4 leading-relaxed">
                          {path.desc}
                        </p>
                        <div className="flex items-center gap-2 text-purple-vivid text-sm font-semibold">
                          Learn More <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  </HoverLift>
                </StaggerItem>
              );
            })}
          </div>
        </StaggerContainer>
      </SectionWrapper>

      {/* CTA Section */}
      <SectionWrapper variant="dark-purple">
        <div className="text-center">
          <FadeIn>
            <h2 className="font-heading text-3xl font-bold text-white mb-4">
              Ready to Take the Next Step?
            </h2>
            <p className="font-body text-white/80 max-w-2xl mx-auto mb-8">
              Join us this Sunday at 9 AM or explore our growth pathways to
              discover how you can deepen your faith and fulfill your purpose.
            </p>
            <Link href="/new-here">
              <button className="inline-flex items-center justify-center font-heading text-[13px] font-semibold uppercase tracking-[1.5px] leading-4 transition-all duration-200 ease-in-out cursor-pointer bg-white text-purple-dark hover:bg-off-white rounded-[4px] px-8 py-3 min-w-[140px]">
                Plan Your Visit
              </button>
            </Link>
          </FadeIn>
        </div>
      </SectionWrapper>
    </>
  );
}
