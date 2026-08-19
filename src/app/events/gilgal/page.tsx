"use client";

import PageHero from "@/components/ui/PageHero";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Eyebrow from "@/components/ui/Eyebrow";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useState } from "react";
import Image from "next/image";
import { Check, Compass, Flame, ShieldCheck } from "lucide-react";
import { events as eventsAPI } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

const EVENT_ID = "gilgal";

const marks = [
  {
    icon: Compass,
    title: "Realignment",
    desc: "A spiritual checkpoint where direction is corrected before the next season begins.",
  },
  {
    icon: Flame,
    title: "Renewal",
    desc: "Intense sessions of worship, prayer, and the Word, aimed at breaking limitations.",
  },
  {
    icon: ShieldCheck,
    title: "Refiring",
    desc: "Partakers are refined, empowered, and commissioned for greater impact.",
  },
];

export default function GilgalPage() {
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const { success, error } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await eventsAPI.registerForEvent(EVENT_ID, formData);
      setRegistered(true);
      success("Registration successful!");
    } catch (err) {
      error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div data-brand="events">
      <PageHero
        eyebrow="Tri-annual Retreat"
        title="Gilgal Camp Meeting"
        subtitle="June 5 — 8, 2026"
        description="A prophetic gathering programmed by God to deliver to every Partaker the dividends of camping alone with Him."
        backgroundImage="/site/campus-aerial.jpg"
        backgroundPosition="center 40%"
        wash="deep"
        actions={[
          { href: "#register", label: "Register Free", variant: "primary" },
          { href: "#about", label: "About Gilgal", variant: "secondary", onDark: true },
        ]}
        stats={[
          { value: "4 days", label: "June 5 – 8, 2026" },
          { value: "Free", label: "Accommodation included" },
          { value: "Tri-annual", label: "Held three times a year" },
        ]}
      />

      {/* ── WHAT GILGAL DOES ── */}
      <SectionWrapper variant="white" id="about">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <Eyebrow>About Gilgal</Eyebrow>
            <h2 className="mt-5 font-heading text-3xl font-bold leading-[1.12] text-slate md:text-[38px]">
              The place where the reproach was rolled away.
            </h2>

            <div className="mt-8 space-y-5 font-body text-[15.5px] leading-[1.8] text-[#3A3740] md:text-[17px]">
              <p>
                Gilgal is a prophetic gathering convened by The Ecclesia Embassy, programmed by God
                to deliver to every Partaker a deluge of eternal realities and benefits that can only
                be realized when we are fully aware of the dividends of &lsquo;camping alone with
                God&rsquo;.
              </p>
              <p>
                It is a sacred space for personal and corporate Spiritual Realignment, Renewal, and
                Refiring. Drawing inspiration from the Biblical significance of Gilgal, it is a place
                where the reproach of Egypt was rolled away (Joshua 5:9); this meeting emphasizes
                transition, consecration, and the establishment of believers in their divine identity
                and God-given purpose.
              </p>
              <p>
                At Gilgal, Partakers are led through intense sessions of worship, prayer, and the
                Word, with a strong focus on breaking limitations, activating spiritual authority,
                and fostering kingdom consciousness. The platform serves as a spiritual checkpoint
                where individuals are refined, empowered, and commissioned for greater impacts in
                their personal lives, ministries, and spheres of influence.
              </p>
              <p>
                Gilgal will forever stand as a call to deeper intimacy with God and a life of
                intentional kingdom representation. Something tangible, undeniable and drastic will
                happen to you in Gilgal that will leave you with an indelible mark forever.
              </p>
              <p className="pt-2 text-right font-heading text-sm font-semibold text-slate">
                — Victor Oluwadamilare
              </p>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-slate/8 shadow-[0_28px_70px_rgba(13,9,32,0.16)]">
              <Image
                src="/site/worship-lead.jpg"
                alt="Worship at a camp meeting"
                fill
                sizes="(max-width: 1024px) 100vw, 36vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(13,9,32,0.78)_100%)]"
              />
              <p className="absolute inset-x-6 bottom-6 font-serif text-lg italic leading-8 text-white/92">
                &ldquo;This day have I rolled away the reproach of Egypt from off you.&rdquo;
                <span className="mt-2 block font-body text-xs font-semibold uppercase not-italic tracking-widest text-[var(--brand-accent-text)]">
                  Joshua 5:9
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {marks.map((mark) => {
            const Icon = mark.icon;
            return (
              <div key={mark.title} className="brand-card h-full p-7">
                <div className="brand-tile h-12 w-12">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-heading text-lg font-bold text-slate">{mark.title}</h3>
                <p className="mt-3 font-body text-sm leading-7 text-gray-text">{mark.desc}</p>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* ── REGISTER ── */}
      <SectionWrapper variant="brand-ink" id="register" hairline>
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <Eyebrow>Registration</Eyebrow>
            <h2 className="mt-6 font-heading text-3xl font-bold leading-[1.1] text-white md:text-[42px]">
              Come and camp alone with God.
            </h2>
            <p className="mt-5 font-body text-[15px] leading-8 text-white/66">
              Registration is free and includes accommodation. Reserve your place and
              we&rsquo;ll send the details by email.
            </p>

            {/* Columns are weighted to the label lengths rather than split evenly:
                "Accommodation" in tracked uppercase is roughly four times the width
                of "2026", and equal thirds clipped it out of its card. */}
            <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-[0.78fr_1.02fr_1.2fr]">
              {[
                { value: "June 5 – 8", label: "2026" },
                { value: "Free", label: "Registration" },
                { value: "On-site", label: "Accommodation" },
              ].map((item) => (
                <div key={item.label} className="brand-card-dark min-w-0 px-4 py-5 lg:px-3 xl:px-4">
                  <p className="font-heading text-lg font-bold text-white">{item.value}</p>
                  <p className="mt-1 font-body text-[10px] uppercase tracking-[0.1em] text-white/55">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/12 bg-[var(--brand-ink)]/72 p-6 backdrop-blur-md md:p-8">
            {registered ? (
              <div className="rounded-[22px] border border-white/10 bg-white/8 p-8 text-center">
                <Check className="mx-auto mb-3 h-10 w-10 text-[var(--brand-accent-text)]" />
                <h3 className="font-heading text-lg font-bold text-white">Registration complete</h3>
                <p className="mt-2 font-body text-sm text-white/65">
                  Check your email for confirmation and details.
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-heading text-xl font-bold text-white">Reserve your place</h3>
                <p className="mt-2 font-body text-sm text-white/55">
                  Free — accommodation included.
                </p>
                <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
                  <Input
                    id="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                  <Button type="submit" variant="giving" className="mt-1 w-full" disabled={loading}>
                    {loading ? "Registering..." : "Register for Gilgal"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
