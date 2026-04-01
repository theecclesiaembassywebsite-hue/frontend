"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { BookOpen, User, Calendar, Check } from "lucide-react";
import { training } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

const programs = [
  { name: "Certificate in Ministry Foundations", duration: "6 months", desc: "Foundational truths, doctrine, and practical ministry skills." },
  { name: "Diploma in Kingdom Leadership", duration: "1 year", desc: "Leadership principles, church administration, and strategic ministry." },
  { name: "Advanced Diploma in Apostolic Ministry", duration: "18 months", desc: "Apostolic mandate, prophetic ministry, and church planting." },
];

const programOptions = programs.map((p) => ({ value: p.name, label: p.name }));

export default function KISOLAMPage() {
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await training.enrollTraining("KISOLAM", {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        additionalInfo: {
          program: formData.get("program") as string,
        },
      });
      success("Registration successful! Welcome to KISOLAM.");
      setRegistered(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="relative flex items-center justify-center py-28 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple-vivid" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <BookOpen className="mx-auto h-12 w-12 text-white/80 mb-3" />
          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">KISOLAM</h1>
          <h6 className="mt-2 font-serif text-lg font-light text-off-white">
            Kingdom International School of Life and Ministry
          </h6>
        </div>
      </section>

      <SectionWrapper variant="white">
        <div className="mx-auto max-w-2xl text-center mb-10">
          <h2 className="font-heading text-[28px] font-bold text-slate">Programs Offered</h2>
        </div>
        <div className="mx-auto max-w-2xl space-y-4">
          {programs.map((p) => (
            <div key={p.name} className="rounded-[8px] border border-gray-border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-heading text-base font-bold text-slate">{p.name}</h3>
                  <p className="mt-1 font-body text-sm text-gray-text">{p.desc}</p>
                </div>
                <span className="shrink-0 rounded-full bg-purple-light px-3 py-1 text-[11px] font-heading font-semibold text-purple">
                  {p.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Faculty placeholder */}
      <SectionWrapper variant="off-white">
        <div className="text-center mb-6">
          <h2 className="font-heading text-xl font-bold text-slate">Faculty</h2>
        </div>
        <div className="flex justify-center gap-6">
          {["Lead Faculty", "Associate Faculty", "Guest Faculty"].map((name) => (
            <div key={name} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-light mb-2">
                <User className="h-7 w-7 text-purple/40" />
              </div>
              <p className="font-heading text-xs font-semibold text-slate">{name}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Academic Calendar */}
      <SectionWrapper variant="white">
        <div className="mx-auto max-w-md text-center">
          <Calendar className="mx-auto h-8 w-8 text-purple mb-3" />
          <h2 className="font-heading text-xl font-bold text-slate mb-4">Academic Calendar</h2>
          <div className="space-y-2 text-sm font-body text-gray-text">
            <p>Session 1: January — June 2026</p>
            <p>Session 2: July — December 2026</p>
            <p>Application deadline: Two weeks before session start</p>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="dark-purple">
        <div className="mx-auto max-w-md text-center">
          <h2 className="font-heading text-[28px] font-bold text-white mb-6">Register Now</h2>
          {registered ? (
            <div className="rounded-[8px] bg-white/10 p-8">
              <Check className="mx-auto h-10 w-10 text-success mb-3" />
              <h3 className="font-heading text-lg font-bold text-white">Registration Submitted!</h3>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input id="name" name="name" placeholder="Full Name" required />
              <Input id="email" name="email" type="email" placeholder="Email Address" required />
              <Input id="phone" name="phone" type="tel" placeholder="Phone Number" required />
              <Select id="program" name="program" options={programOptions} placeholder="Select a Program" defaultValue="" required />
              <Button type="submit" variant="giving" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Register & Pay"}
              </Button>
            </form>
          )}
        </div>
      </SectionWrapper>
    </>
  );
}
