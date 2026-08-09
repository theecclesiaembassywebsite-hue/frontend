"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionIntro from "@/components/ui/SectionIntro";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import ProgramHero from "@/components/training/ProgramHero";
import { FadeIn } from "@/components/ui/Motion";
import Image from "next/image";
import {
  BookOpen,
  Calendar,
  ExternalLink,
  GraduationCap,
  Phone,
  Users,
} from "lucide-react";

// EIS is managed on its own external site. Replace this once that site is live.
const EIS_WEBSITE_URL = "https://eis.example.com"; // TODO: replace with live EIS site URL once available

const admissionsHighlights = [
  {
    icon: BookOpen,
    title: "Balanced Curriculum",
    desc: "A learning model that combines academic excellence with spiritual growth and intentional values.",
  },
  {
    icon: Calendar,
    title: "Structured School Year",
    desc: "Three terms per academic year, with clear rhythms for learning, breaks, and family planning.",
  },
  {
    icon: Phone,
    title: "Admissions Support",
    desc: "Parents can begin with an inquiry and receive guidance on tours, fees, expectations, and next steps.",
  },
];

const familyReasons = [
  {
    icon: GraduationCap,
    title: "Excellent learning culture",
    desc: "Children are nurtured to grow in knowledge, character, confidence, and discipline.",
  },
  {
    icon: Users,
    title: "Parent partnership",
    desc: "Families stay close to the journey through communication, support, and shared intentionality.",
  },
  {
    icon: BookOpen,
    title: "Kingdom-centered growth",
    desc: "Education is approached as more than academics, shaping values and worldview alongside skill.",
  },
];

const campusTiles = [
  {
    src: "/site/eis-facility-library.jpg",
    alt: "Reading corner with a book cabinet at Ecclesia International School",
    label: "Reading corner",
  },
  {
    src: "/site/eis-facility-classroom.jpg",
    alt: "An early-years classroom at Ecclesia International School",
    label: "Early years",
  },
  {
    src: "/site/eis-facility-hallway.jpg",
    alt: "A school hallway lettered with the words kindness is free",
    label: "Everyday culture",
  },
];

export default function EISPage() {
  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openEISWebsite() {
    window.open(EIS_WEBSITE_URL, "_blank", "noopener,noreferrer");
  }

  return (
    <div data-brand="eis">
      <ProgramHero
        eyebrow="Admissions"
        title="EIS"
        subtitle="Ecclesia International School"
        description="A learning environment where academic excellence meets spiritual intentionality, helping children grow with clarity, confidence, and kingdom values."
        logoSrc="/eis-logo.png"
        logoAlt="EIS - Ecclesia International School"
        logoWidth={987}
        logoHeight={600}
        logoClassName="max-w-[560px]"
        backgroundImage="/site/eis-campus.jpg"
        backgroundPosition="center 35%"
        chips={[
          "Crèche to Primary",
          "Intentional values education",
          "Parent-guided admissions journey",
        ]}
        stats={[
          { value: "Crèche → Primary", label: "Levels offered" },
          { value: "3 terms", label: "Per academic year" },
          { value: "Guided", label: "Parent onboarding" },
        ]}
        aside={
          <div>
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
              What to expect
            </p>
            <div className="mt-4 space-y-3">
              {[
                "A calm admissions process that starts with a parent inquiry.",
                "Clear information on tours, schedules, and family expectations.",
                "A school identity centered on learning with purpose and intentionality.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: "var(--brand-accent)" }}
                  />
                  <p className="font-body text-sm leading-6 text-white/78">{item}</p>
                </div>
              ))}
            </div>
          </div>
        }
        actions={
          <>
            <Button variant="primary" onClick={openEISWebsite}>
              Visit the EIS Website
            </Button>
            <Button variant="secondary" onDark onClick={() => scrollToSection("overview")}>
              View Overview
            </Button>
          </>
        }
      />

      {/* ── LIFE AT EIS ──────────────────────────────────────────────
          EIS is the one destination that leads with photography of the
          children themselves — a bright mosaic, not a wall of dark cards. */}
      <SectionWrapper variant="white" density="compact">
        <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14">
          <FadeIn direction="up">
            <div className="relative overflow-hidden rounded-[30px] border border-slate/8 bg-white p-4 shadow-[0_28px_70px_rgba(10,18,32,0.1)] md:p-6">
              <Image
                src="/site/eis-gallery.jpg"
                alt="Pupils of Ecclesia International School at study, play and assembly"
                width={1600}
                height={800}
                sizes="(max-width: 1024px) 100vw, 62vw"
                className="h-auto w-full object-contain"
              />
            </div>
          </FadeIn>

          <div>
            <Eyebrow>Life at EIS</Eyebrow>
            <h2 className="mt-5 font-heading text-3xl font-bold leading-[1.12] tracking-tight text-slate md:text-[38px]">
              Rescue a child. Restore a life. Raise a leader.
            </h2>
            <p className="mt-5 font-body text-[15px] leading-8 text-gray-text">
              Intentionality is written on the school gate and lived out in the classrooms — from
              crèche and pre-nursery through to primary, in reading, in music, in sport, and in the
              everyday habits children carry home.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {campusTiles.map((tile) => (
                <figure key={tile.src} className="group">
                  <div className="relative aspect-square overflow-hidden rounded-[16px] border border-slate/8">
                    <Image
                      src={tile.src}
                      alt={tile.alt}
                      fill
                      sizes="(max-width: 640px) 30vw, 12vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="mt-2 font-body text-[11px] leading-4 text-gray-text">
                    {tile.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── ADMISSIONS PILLARS ───────────────────────────────────────
          Presented as a numbered progression rather than three equal tiles,
          because for a parent this is a sequence, not a menu. */}
      <SectionWrapper variant="paper" id="overview">
        <SectionIntro
          align="center"
          eyebrow="Schooling shaped with intention"
          title="What the school offers a family"
          description="EIS communicates a learning culture where academic structure, values education, and healthy family partnership work together."
        />

        <div className="relative mt-14">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-[38px] hidden h-px bg-[var(--brand-accent-line)] md:block"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {admissionsHighlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <FadeIn key={item.title} direction="up" delay={index * 0.07}>
                  <div className="relative h-full">
                    <div className="brand-tile relative z-10 mx-auto h-[76px] w-[76px] !rounded-full ring-8 ring-[#FFFDF8]">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="brand-card -mt-10 h-full p-6 pt-14 text-center md:p-7 md:pt-16">
                      <span className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--brand-accent-text)]">
                        Step {index + 1}
                      </span>
                      <h3 className="mt-3 font-heading text-lg font-bold text-slate">
                        {item.title}
                      </h3>
                      <p className="mt-3 font-body text-sm leading-7 text-gray-text">{item.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </SectionWrapper>

      {/* ── WHY PARENTS CHOOSE EIS ── */}
      <SectionWrapper
        variant="brand-ink"
        id="visit"
        hairline
        backgroundImage="/site/eis-campus.jpg"
        backgroundPosition="center 40%"
      >
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <Eyebrow>Why parents choose EIS</Eyebrow>
            <h2 className="mt-6 font-heading text-3xl font-bold leading-[1.1] text-white md:text-[42px]">
              A calm and clear admissions entry point
            </h2>
            <p className="mt-5 font-body text-[15px] leading-8 text-white/66">
              Admissions, tours, fees, and enrollment are managed directly on the EIS website. This
              page is here to introduce the school and its identity.
            </p>

            <div className="mt-9 space-y-4">
              {familyReasons.map((reason) => {
                const Icon = reason.icon;
                return (
                  <div key={reason.title} className="brand-card-dark p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                        <Icon className="h-5 w-5 text-[var(--brand-accent-text)]" />
                      </div>
                      <div>
                        <h3 className="font-heading text-base font-bold text-white">
                          {reason.title}
                        </h3>
                        <p className="mt-2 font-body text-sm leading-7 text-white/68">
                          {reason.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-[30px] border border-white/12 bg-[var(--brand-ink)]/72 p-8 text-center backdrop-blur-md md:p-10">
            <div className="brand-tile mx-auto h-16 w-16">
              <ExternalLink className="h-7 w-7" />
            </div>
            <h2 className="mt-7 font-heading text-2xl font-bold text-white md:text-[30px]">
              Ready to learn more?
            </h2>
            <p className="mx-auto mt-4 max-w-sm font-body text-sm leading-7 text-white/66">
              Tours, admissions, fees, and enrollment for EIS are all handled on the school&apos;s own
              website.
            </p>
            <div className="mt-9 flex justify-center">
              <Button variant="primary" className="gap-2" onClick={openEISWebsite}>
                Visit the EIS Website <ExternalLink size={15} />
              </Button>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
