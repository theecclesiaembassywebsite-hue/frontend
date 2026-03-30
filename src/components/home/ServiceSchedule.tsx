"use client";

import { Calendar, Clock } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/Motion";

interface ServiceCard {
  day: string;
  serviceName: string;
  time: string;
  description: string;
}

const services: ServiceCard[] = [
  {
    day: "Sunday",
    serviceName: "Word & Life Service",
    time: "9:00 AM",
    description: "Join us for inspiring worship and biblical teaching",
  },
  {
    day: "Tuesday",
    serviceName: "Prayer & Intercession",
    time: "6:00 PM",
    description: "Gather together in corporate prayer and intercession",
  },
  {
    day: "Friday",
    serviceName: "Worship Encounter",
    time: "6:00 PM",
    description: "Experience intimate worship and God's presence",
  },
  {
    day: "1st–3rd of Every Month",
    serviceName: "As Unto The Lord",
    time: "6:00 AM & 6:00 PM",
    description: "Special consecration services for deeper spiritual growth",
  },
];

export default function ServiceSchedule() {
  return (
    <SectionWrapper variant="dark-slate">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        {/* Section Header */}
        <FadeIn direction="down">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
              Service Schedule
            </h2>
            <p className="font-body text-lg text-purple-light/80">
              Join us in fellowship
            </p>
          </div>
        </FadeIn>

        {/* Service Cards Grid */}
        <StaggerContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <StaggerItem key={index}>
                <div className="rounded-lg bg-white/5 backdrop-blur-sm border border-transparent hover:border-purple-vivid/30 transition-all h-full overflow-hidden group">
                  {/* Gradient Accent Line */}
                  <div className="h-1 bg-gradient-to-r from-purple to-purple-vivid rounded-t-lg" />

                  {/* Card Content */}
                  <div className="p-6 text-center">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-purple-vivid/10 rounded-lg group-hover:bg-purple-vivid/20 transition-colors">
                        <Calendar className="w-6 h-6 text-purple-vivid" />
                      </div>
                    </div>

                    {/* Day */}
                    <h3 className="font-heading text-sm font-semibold text-purple-vivid uppercase tracking-wider mb-2">
                      {service.day}
                    </h3>

                    {/* Service Name */}
                    <p className="font-heading text-xl font-bold text-white mb-3">
                      {service.serviceName}
                    </p>

                    {/* Time */}
                    <p className="font-body text-purple-vivid font-semibold mb-3 flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4" />
                      {service.time}
                    </p>

                    {/* Description */}
                    <p className="font-body text-sm text-white/70 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      </div>
    </SectionWrapper>
  );
}
