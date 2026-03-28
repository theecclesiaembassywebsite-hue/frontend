import SectionWrapper from "@/components/ui/SectionWrapper";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { GraduationCap, BookOpen, Users, Music, ArrowRight } from "lucide-react";

const pathways = [
  {
    icon: GraduationCap,
    title: "Intentionality Class",
    desc: "A structured course to prepare you for active service in the church. Video lessons, written materials, live teachings, and a final exam.",
    href: "/grow/intentionality-class",
    cta: "Start the Class",
  },
  {
    icon: BookOpen,
    title: "Sermon Archive",
    desc: "Access our full library of audio and video teachings. Listen, learn, and grow in your understanding of the Word.",
    href: "/resources/audio",
    cta: "Browse Sermons",
  },
  {
    icon: Users,
    title: "Join a Squad",
    desc: "Kingdom Life Squads are our small-group ministry arm. Find a squad that matches your calling and connect with like-minded believers.",
    href: "/kingdom/squads",
    cta: "Find a Squad",
  },
  {
    icon: Music,
    title: "Devotional Resources",
    desc: "Books, bulletins, and ministry materials to deepen your walk with God. Many resources are free for registered members.",
    href: "/resources/library",
    cta: "View Resources",
  },
];

export default function GrowPage() {
  return (
    <>
      <section className="relative flex items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            Grow with Us
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            Deepen your involvement and discover your assignment
          </h6>
        </div>
      </section>

      {/* Growth Journey */}
      <SectionWrapper variant="white">
        <div className="mx-auto max-w-3xl text-center mb-10">
          <h2 className="font-heading text-[28px] font-bold text-slate">
            Your Growth Path
          </h2>
          <p className="mt-3 font-body text-base text-gray-text leading-relaxed">
            At The Ecclesia Embassy, we believe in intentional growth. Whether
            you are new to the faith or a seasoned believer, there is always a
            next step. This page is your starting point.
          </p>
        </div>

        {/* Journey Steps */}
        <div className="mx-auto max-w-2xl mb-12">
          <div className="flex flex-col gap-0">
            {[
              "Sign Up — Create your account and join the community",
              "Intentionality Class — Complete the service readiness course",
              "Access Resources — Sermons, books, and devotional materials",
              "Join a Squad — Connect with a Kingdom Life Squad",
              "Serve — Step into your assignment in the church",
            ].map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple text-white font-heading text-sm font-bold">
                    {i + 1}
                  </div>
                  {i < 4 && <div className="w-0.5 flex-1 bg-purple-light my-1" />}
                </div>
                <p className="font-body text-sm text-slate pb-6">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Pathway Cards */}
      <SectionWrapper variant="off-white">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {pathways.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.title}
                href={p.href}
                className="group flex gap-4 rounded-[8px] border border-gray-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-light">
                  <Icon className="h-6 w-6 text-purple" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-bold text-slate group-hover:text-purple-vivid transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-1 font-body text-sm text-gray-text leading-relaxed">
                    {p.desc}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-heading font-semibold uppercase tracking-wider text-purple-vivid">
                    {p.cta} <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper variant="dark-purple">
        <div className="text-center">
          <h2 className="font-heading text-[28px] font-bold text-white">
            Ready to Begin?
          </h2>
          <p className="mt-3 font-body text-base text-white/70">
            Start with the Intentionality Class and take the first step toward
            fulfilling your assignment in the Kingdom.
          </p>
          <Link href="/grow/intentionality-class">
            <Button variant="secondary" onDark className="mt-6">
              Enroll Now
            </Button>
          </Link>
        </div>
      </SectionWrapper>
    </>
  );
}
