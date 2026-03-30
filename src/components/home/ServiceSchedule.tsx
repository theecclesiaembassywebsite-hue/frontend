"use client";

import { Clock } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/Motion";

const services = [
  {
    day: "Sunday",
    name: "Word & Life Service",
    time: "9:00 AM",
    description: "Our flagship gathering — worship, the Word, and life application.",
  },
  {
    day: "Tuesday",
    name: "Prayer & Intercession",
    time: "6:00 PM",
    description: "A time of corporate prayer, intercession, and spiritual warfare.",
  },
  {
    day: "Friday",
    name: "Worship Encounter",
    time: "6:00 PM",
    description: "An evening of deep worship and encounter with God's presence.",
  },
  {
    day: "1st — 3rd",
    label: "of every month",
    name: "As Unto The Lord",
    time: "6 AM & 6 PM",
    description: "Special consecration services to begin each month in God's presence.",
  },
];

export default function ServiceSchedule() {
  return (
    <SectionWrapper variant="dark-slate">
      <FadeIn>
        <div className="text-center mb-14">
          <p className="font-heading text-xs font-semibold uppercase tracking-[3px] text-purple-vivid mb-3">
            When We Gather
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white">
            Service Schedule
          </h2>
        </div>
      </FadeIn>

      <StaggerContainer staggerDelay={0.1}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {services.map((service, i) => (
            <StaggerItem key={i}>
              <div className="group flex items-stretch rounded-lg overflow-hidden bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] hover:border-gold/40 transition-all duration-300">
                {/* Left: Day column */}
                <div className="w-28 sm:w-36 shrink-0 flex flex-col items-center justify-center py-6 px-3 border-r border-white/[0.10]">
                  <span className="font-heading text-xl sm:text-2xl font-bold text-white leading-tight">
                    {service.day}
                  </span>
                  {service.label && (
                    <span className="font-body text-[10px] text-white/60 mt-0.5">
                      {service.label}
                    </span>
                  )}
                </div>

                {/* Middle: Name + Description */}
                <div className="flex-1 py-6 px-5 sm:px-6 min-w-0">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gold">
                    {service.name}
                  </h3>
                  <p className="font-body text-sm text-white/80 mt-1.5 line-clamp-2 sm:line-clamp-none leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Right: Time */}
                <div className="shrink-0 flex items-center px-5 sm:px-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gold hidden sm:block" />
                    <span className="font-heading text-sm font-bold text-white whitespace-nowrap">
                      {service.time}
                    </span>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </div>
      </StaggerContainer>

      {/* Subtle bottom accent */}
      <FadeIn delay={0.5}>
        <p className="text-center mt-10 font-serif italic text-sm text-white/30">
          Join us in fellowship
        </p>
      </FadeIn>
    </SectionWrapper>
  );
}
