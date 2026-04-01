"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { Music, Check } from "lucide-react";
import { training } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

const courses = [
  { name: "Vocal Training", duration: "12 weeks", level: "Beginner — Advanced" },
  { name: "Instrumental Music (Piano, Guitar, Drums)", duration: "16 weeks", level: "Beginner — Intermediate" },
  { name: "Music Theory & Composition", duration: "8 weeks", level: "All levels" },
  { name: "Sound Engineering", duration: "10 weeks", level: "Intermediate" },
  { name: "Creative Arts (Dance, Drama)", duration: "12 weeks", level: "All levels" },
];

export default function TEMAPage() {
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await training.enrollTraining("TEMA", {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        additionalInfo: {
          course: formData.get("course") as string,
        },
      });
      success("Enrollment successful! Welcome to TEMA.");
      setEnrolled(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to enroll. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="relative flex items-center justify-center py-28 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-near-black" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <Music className="mx-auto h-12 w-12 text-white/80 mb-3" />
          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">TEMA</h1>
          <h6 className="mt-2 font-serif text-lg font-light text-off-white">
            The Ecclesia Music and Arts Academy
          </h6>
        </div>
      </section>

      <SectionWrapper variant="white">
        <div className="mx-auto max-w-2xl text-center mb-10">
          <h2 className="font-heading text-[28px] font-bold text-slate">Curriculum</h2>
          <p className="mt-3 font-body text-base text-gray-text">Training musicians, vocalists, and creatives for kingdom excellence.</p>
        </div>
        <div className="mx-auto max-w-2xl space-y-3">
          {courses.map((c) => (
            <div key={c.name} className="flex items-center justify-between rounded-[8px] border border-gray-border bg-off-white p-4">
              <div>
                <h3 className="font-heading text-sm font-bold text-slate">{c.name}</h3>
                <p className="text-[11px] text-gray-text">{c.level}</p>
              </div>
              <span className="text-xs font-heading font-semibold text-purple">{c.duration}</span>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper variant="dark-purple">
        <div className="mx-auto max-w-md text-center">
          <h2 className="font-heading text-[28px] font-bold text-white mb-6">Enroll Now</h2>
          {enrolled ? (
            <div className="rounded-[8px] bg-white/10 p-8">
              <Check className="mx-auto h-10 w-10 text-success mb-3" />
              <h3 className="font-heading text-lg font-bold text-white">Enrollment Successful!</h3>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input id="name" name="name" placeholder="Full Name" required />
              <Input id="email" name="email" type="email" placeholder="Email Address" required />
              <Input id="phone" name="phone" type="tel" placeholder="Phone Number" required />
              <Input id="course" name="course" placeholder="Preferred Course" required />
              <Button type="submit" variant="giving" className="w-full" disabled={loading}>
                {loading ? "Enrolling..." : "Enroll & Pay"}
              </Button>
            </form>
          )}
        </div>
      </SectionWrapper>
    </>
  );
}
