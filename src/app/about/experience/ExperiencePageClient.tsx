"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionIntro from "@/components/ui/SectionIntro";
import { FadeIn } from "@/components/ui/Motion";
import { gallery } from "@/lib/api";

interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
}

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

export default function ExperiencePageClient() {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    gallery.getImages().then((data) => setImages(data || [])).catch(() => {});
  }, []);

  return (
    <div data-brand="experience">
      <PageHero
        eyebrow="The Ecclesia Experience"
        title="What makes this community different"
        subtitle="Word, Warfare, and Worship — held together."
        description="A nation with systems, language, and rhythms that help believers grow together, and a culture you can feel from the first gathering."
        backgroundImage="/site/experience-gathering.jpg"
        backgroundPosition="center 30%"
        compact
      />

      {/* ── NARRATIVE ──────────────────────────────────────────────────
          Deliberately kept as running prose. The foundations and the
          expressions belong in one continuous account of the culture, not
          split into cards and rails. */}
      <SectionWrapper variant="white">
        <div className="mx-auto max-w-3xl">
          <SectionIntro
            align="center"
            eyebrow="Given in 2016"
            title="A nation built on Word, Prayer, and Worship"
          />

          <div className="mt-10 space-y-6 font-body text-base leading-[1.8] text-gray-text md:text-[17px]">
            <p>
              The Ecclesia Embassy is a nation with systems, language, and rhythms that help
              believers grow together. At the centre of the movement are the three foundations
              God gave in 2016: the Word, Warfare (Prayer), and Worship.
            </p>
            <p>
              That foundation shapes our weekly rhythm. Sundays give priority to the Word in our{" "}
              <span className="font-semibold text-slate">Word &amp; Life Service</span>, Tuesdays
              to Prayer and Warfare in the{" "}
              <span className="font-semibold text-slate">Prayer Service</span>, and Fridays to
              Worship in the{" "}
              <span className="font-semibold text-slate">Worship Service</span>. Our monthly{" "}
              <span className="font-semibold text-slate">As unto the Lord</span> services, held
              from the 1st to the 3rd of each month, deepen that consecration.
            </p>
            <p>
              Life here is also relational and missional. Through Church In the House, the e-Hub,
              the Kingdom Model Life Squad, the Kingdom Influencing Platform, and the Kingdom
              International School of Life and Ministry, Ecclesians are discipled, equipped, and
              sent to live as Christ&rsquo;s ambassadors with clarity and relevance.
            </p>
            <p>
              That culture is expressed intentionally in the way we worship, honour one another,
              serve sacrificially, and respond to the Word. At The Ecclesia Embassy, worship is
              not treated as routine, relationships are handled like family, stewardship is seen
              as service to the King, and the Word is expected to produce real obedience.
            </p>
          </div>
        </div>
      </SectionWrapper>

      {/* ── GALLERY ── */}
      {images.length > 0 && (
        <SectionWrapper variant="paper">
          <SectionIntro
            align="center"
            eyebrow="In the room"
            title="Life at The Ecclesia Embassy"
          />
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {images.map((img) => (
              <figure
                key={img.id}
                className="group relative aspect-square overflow-hidden rounded-[18px] border border-slate/8 bg-purple-light"
              >
                {/* Gallery URLs are admin-supplied and unbounded, so they bypass
                    next/image's configured remote hosts. */}
                <img loading="lazy" decoding="async"
                  src={img.url}
                  alt={img.caption || "The Ecclesia Embassy"}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {img.caption && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(11,9,20,0.85))] px-3 pb-2.5 pt-6">
                    <p className="line-clamp-1 font-body text-[11px] text-white/90">
                      {img.caption}
                    </p>
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* ── TESTIMONIES ── */}
      <SectionWrapper variant="brand-ink" hairline>
        <SectionIntro
          align="center"
          tone="dark"
          eyebrow="In their words"
          title="What our members say"
        />

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <FadeIn key={testimonial.text} direction="up" delay={index * 0.06}>
              <figure className="brand-card-dark flex h-full flex-col p-7">
                <Quote className="h-8 w-8 text-[var(--brand-accent-text)]" />
                <blockquote className="mt-5 flex-1 font-serif text-base italic leading-relaxed text-white/82">
                  &ldquo;{testimonial.text}&rdquo;
                </blockquote>
                <figcaption className="mt-6 font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                  {testimonial.name}
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
