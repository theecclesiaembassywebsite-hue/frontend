"use client";

import { useEffect, useState } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { Quote } from "lucide-react";
import { gallery } from "@/lib/api";

const testimonials = [
  {
    text: "The Ecclesia Embassy has transformed my understanding of the Word. I have found a family that truly lives out the kingdom mandate.",
    name: "Member",
  },
  {
    text: "The worship encounters here are unlike anything I have experienced. There is a tangible presence of God in every gathering.",
    name: "Member",
  },
  {
    text: "Through the Intentionality Class and squad fellowship, I have grown more in one year than in a decade of church attendance elsewhere.",
    name: "Member",
  },
];

export default function ExperiencePage() {
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    gallery.getImages().then((data) => setImages(data || [])).catch(() => {});
  }, []);

  return (
    <>
      {/* Hero Banner */}
      <section className="relative flex items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            The Ecclesia Experience
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            What makes this community different
          </h6>
        </div>
      </section>

      {/* Narrative */}
      <SectionWrapper variant="white">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="font-heading text-[28px] font-bold text-slate text-center">
            An Apostolic &amp; Prophetic Assignment
          </h2>
          <p className="font-body text-base text-gray-text leading-relaxed">
            The Ecclesia Embassy is not just a church — it is a prophetic
            community built on the foundation of the apostles, with Christ as
            the chief cornerstone. Our gatherings are marked by the depth of the
            Word, the intensity of worship, and the warmth of genuine fellowship.
          </p>
          <p className="font-body text-base text-gray-text leading-relaxed">
            From our Sunday Word &amp; Life Services to Tuesday Prayer &amp;
            Intercession, Friday Worship Encounters, and the monthly As Unto The
            Lord consecrations — every gathering is designed to bring you closer
            to God and equip you for your assignment in the earth.
          </p>
          <p className="font-body text-base text-gray-text leading-relaxed">
            Through our Church-in-the-Home hubs, Kingdom Life Squads, and the
            Ecclesia Nation community, we ensure that no member walks alone. You
            are connected, accountable, and growing — whether you are in Abuja or
            anywhere in the world through our e-Hub.
          </p>
        </div>
      </SectionWrapper>

      {/* Photo Gallery */}
      {images.length > 0 && (
        <SectionWrapper variant="off-white">
          <div className="text-center mb-10">
            <h2 className="font-heading text-[28px] font-bold text-slate">
              Life at The Ecclesia Embassy
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {images.map((img) => (
              <div key={img.id} className="relative aspect-square overflow-hidden rounded-[8px] bg-purple-light">
                <img
                  src={img.url}
                  alt={img.caption || "Ecclesia Embassy"}
                  className="h-full w-full object-cover"
                />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1.5">
                    <p className="font-body text-[11px] text-white/90 line-clamp-1">{img.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* Testimonial Carousel */}
      <SectionWrapper variant="dark-purple">
        <div className="text-center mb-10">
          <h2 className="font-heading text-[28px] font-bold text-white">
            What Our Members Say
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex flex-col rounded-[8px] bg-white/5 p-6 backdrop-blur-sm"
            >
              <Quote className="h-8 w-8 text-purple-vivid mb-3" />
              <p className="font-serif text-base italic text-white/80 leading-relaxed flex-1">
                &ldquo;{t.text}&rdquo;
              </p>
              <p className="mt-4 font-heading text-sm font-semibold text-purple-light">
                — {t.name}
              </p>
            </div>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
