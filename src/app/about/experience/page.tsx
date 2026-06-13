"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
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
          <h2 className="text-center font-heading text-[28px] font-bold text-slate">
            A Nation Built on Word, Prayer, and Worship
          </h2>
          <p className="font-body text-base leading-relaxed text-gray-text">
            The Ecclesia Embassy is a nation with systems, language, and rhythms that help
            believers grow together. At the centre of the movement are the three foundations
            God gave in 2016: the Word, Warfare (Prayer), and Worship.
          </p>
          <p className="font-body text-base leading-relaxed text-gray-text">
            That foundation shapes our weekly rhythm. Sundays give priority to the Word,
            Tuesdays to Prayer and Warfare, and Fridays to Worship. Our monthly{" "}
            <span className="font-semibold text-slate">As unto the Lord</span> services,
            held from the 1st to the 3rd of each month, deepens that consecration.
          </p>
          <p className="font-body text-base leading-relaxed text-gray-text">
            Life here is also relational and missional. Through Church In the House, the
            e-Hub, the Kingdom Model Life Squad, the Kingdom Influencing Platform, and the
            Kingdom International School of Life and Ministry, Ecclesians are discipled,
            equipped, and sent to live as Christ&rsquo;s ambassadors with clarity and relevance.
          </p>
          <p className="font-body text-base leading-relaxed text-gray-text">
            That culture is expressed intentionally in the way we worship, honour one another,
            serve sacrificially, and respond to the Word. At The Ecclesia Embassy, worship is
            not treated as routine, relationships are handled like family, stewardship is seen
            as service to the King, and the Word is expected to produce real obedience.
          </p>
        </div>
      </SectionWrapper>

      {/* Photo Gallery */}
      {images.length > 0 && (
        <SectionWrapper variant="off-white">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-[28px] font-bold text-slate">
              Life at The Ecclesia Embassy
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square overflow-hidden rounded-[8px] bg-purple-light"
              >
                <img
                  src={img.url}
                  alt={img.caption || "Ecclesia Embassy"}
                  className="h-full w-full object-cover"
                />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1.5">
                    <p className="font-body line-clamp-1 text-[11px] text-white/90">
                      {img.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* Testimonial Carousel */}
      <SectionWrapper variant="dark-purple">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-[28px] font-bold text-white">
            What Our Members Say
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col rounded-[8px] bg-white/5 p-6 backdrop-blur-sm"
            >
              <Quote className="mb-3 h-8 w-8 text-purple-vivid" />
              <p className="flex-1 font-serif text-base italic leading-relaxed text-white/80">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <p className="mt-4 font-heading text-sm font-semibold text-purple-light">
                - {testimonial.name}
              </p>
            </div>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
