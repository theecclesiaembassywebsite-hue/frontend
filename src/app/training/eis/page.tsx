"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Button from "@/components/ui/Button";
import ProgramHero from "@/components/training/ProgramHero";
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

export default function EISPage() {
  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <ProgramHero
        eyebrow="Admissions"
        title="EIS"
        subtitle="Ecclesia International School"
        description="A learning environment where academic excellence meets spiritual intentionality, helping children grow with clarity, confidence, and kingdom values."
        logoSrc="/eis-logo.png"
        logoAlt="EIS - Ecclesia International School"
        logoWidth={987}
        logoHeight={600}
        chips={[
          "Academic excellence",
          "Intentional values education",
          "Parent-guided admissions journey",
        ]}
        stats={[
          { value: "3", label: "admissions pillars" },
          { value: "3", label: "school terms" },
          { value: "Guided", label: "parent onboarding" },
        ]}
        backgroundClassName="bg-[radial-gradient(circle_at_top_right,rgba(52,152,219,0.2),transparent_28%),linear-gradient(135deg,#0E0B1E_0%,#33204F_55%,#5B2D8E_100%)]"
        overlayClassName="bg-[linear-gradient(180deg,rgba(14,11,30,0.16),rgba(14,11,30,0.48))]"
        logoCardClassName="bg-white/8"
        logoWrapClassName="!bg-transparent shadow-none"
        logoClassName="max-w-[720px] drop-shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
        aside={
          <div>
            <p className="font-heading text-xs font-semibold uppercase tracking-[1.8px] text-white/60">
              What to expect
            </p>
            <div className="mt-4 space-y-3">
              {[
                "A calm admissions process that starts with a parent inquiry.",
                "Clear information on tours, schedules, and family expectations.",
                "A school identity centered on learning with purpose and intentionality.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-gold" />
                  <p className="font-body text-sm leading-6 text-white/80">{item}</p>
                </div>
              ))}
            </div>
          </div>
        }
        actions={
          <>
            <Button variant="primary" onClick={() => window.open(EIS_WEBSITE_URL, "_blank", "noopener,noreferrer")}>
              Visit the EIS Website
            </Button>
            <Button variant="secondary" onDark onClick={() => scrollToSection("overview")}>
              View Overview
            </Button>
          </>
        }
      />

      <SectionWrapper variant="white" id="overview">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-[30px] font-bold text-slate md:text-[34px]">
            Schooling shaped with intention
          </h2>
          <p className="mt-3 font-body text-sm leading-7 text-gray-text md:text-base">
            EIS is presented as more than a school identity mark. It communicates a learning culture
            where academic structure, values education, and healthy family partnership work together.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {admissionsHighlights.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-[24px] border border-gray-border bg-off-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple text-white shadow-purple">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-heading text-lg font-bold text-slate">{item.title}</h3>
                <p className="mt-3 font-body text-sm leading-7 text-gray-text">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      <SectionWrapper variant="off-white" id="visit">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] bg-[linear-gradient(135deg,#0E0B1E_0%,#261A40_100%)] p-6 text-white shadow-xl md:p-8">
            <p className="font-heading text-xs font-semibold uppercase tracking-[1.8px] text-white/60">
              Why parents choose EIS
            </p>
            <h2 className="mt-3 font-heading text-[30px] font-bold text-white md:text-[34px]">
              A calm and clear admissions entry point
            </h2>
            <p className="mt-3 font-body text-sm leading-7 text-white/72 md:text-base">
              Admissions, tours, fees, and enrollment are managed directly on the EIS website. This
              page is here to introduce the school and its identity.
            </p>

            <div className="mt-8 space-y-4">
              {familyReasons.map((reason) => {
                const Icon = reason.icon;

                return (
                  <div
                    key={reason.title}
                    className="rounded-[22px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                        <Icon className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <h3 className="font-heading text-base font-bold text-white">{reason.title}</h3>
                        <p className="mt-2 font-body text-sm leading-7 text-white/72">{reason.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-[28px] border border-gray-border bg-white p-6 shadow-lg text-center md:p-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple text-white shadow-purple">
              <ExternalLink className="h-7 w-7" />
            </div>
            <h2 className="mt-6 font-heading text-2xl font-bold text-slate md:text-[28px]">
              Ready to learn more?
            </h2>
            <p className="mt-3 max-w-sm font-body text-sm leading-7 text-gray-text">
              Tours, admissions, fees, and enrollment for EIS are all handled on the school's own
              website.
            </p>
            <Button
              variant="primary"
              className="mt-8 gap-2"
              onClick={() => window.open(EIS_WEBSITE_URL, "_blank", "noopener,noreferrer")}
            >
              Visit the EIS Website <ExternalLink size={15} />
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
