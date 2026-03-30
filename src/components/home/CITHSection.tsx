"use client";

import Link from "next/link";
import { MapPin, Globe, Home } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { FadeIn, StaggerContainer, StaggerItem, HoverLift } from "@/components/ui/Motion";

export default function CITHSection() {
  const cards = [
    {
      icon: MapPin,
      title: "Find a Hub Near You",
      description: "Discover Church in the Home gatherings in your community",
      cta: "Find a Hub",
      href: "/cith",
    },
    {
      icon: Globe,
      title: "Join the e-Hub",
      description: "Connect with our online Church in the Home community",
      cta: "Join Online",
      href: "/cith/ehub",
    },
    {
      icon: Home,
      title: "Register Your Home as a Hub",
      description: "Open your home for fellowship and spiritual growth",
      cta: "Apply Now",
      href: "/cith/register",
    },
  ];

  return (
    <SectionWrapper variant="white">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <FadeIn>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-slate mb-4">
              Church in the Home
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="font-body text-lg text-gray-text max-w-2xl mx-auto">
              Extending fellowship beyond the building
            </p>
          </FadeIn>
        </div>

        {/* Cards Grid */}
        <StaggerContainer>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <StaggerItem key={index}>
                  <HoverLift>
                    <Link href={card.href}>
                      <div className="rounded-lg border border-gray-border p-8 text-center h-full flex flex-col items-center justify-center hover:shadow-md transition-shadow duration-300">
                        {/* Icon */}
                        <div className="h-16 w-16 rounded-full bg-purple-light flex items-center justify-center mb-6 mx-auto">
                          <IconComponent className="h-8 w-8 text-purple" />
                        </div>

                        {/* Title */}
                        <h3 className="font-heading text-xl font-semibold text-slate mb-3">
                          {card.title}
                        </h3>

                        {/* Description */}
                        <p className="font-body text-gray-text mb-6 flex-grow">
                          {card.description}
                        </p>

                        {/* CTA */}
                        <span className="font-body font-semibold text-purple-vivid hover:underline transition-all duration-300">
                          {card.cta}
                        </span>
                      </div>
                    </Link>
                  </HoverLift>
                </StaggerItem>
              );
            })}
          </div>
        </StaggerContainer>
      </div>
    </SectionWrapper>
  );
}
