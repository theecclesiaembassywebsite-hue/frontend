"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { GraduationCap, BookOpen, Calendar, Phone, Check } from "lucide-react";
import { training } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

export default function EISPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await training.enrollTraining("EIS", {
        name: formData.get("parentName") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
      });
      success("Inquiry submitted! Our admissions team will contact you shortly.");
      setSubmitted(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to submit inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="relative flex items-center justify-center py-28 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <GraduationCap className="mx-auto h-12 w-12 text-white/80 mb-3" />
          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">EIS</h1>
          <h6 className="mt-2 font-serif text-lg font-light text-off-white">
            Ecclesia International School — Early Years & Primary
          </h6>
        </div>
      </section>

      <SectionWrapper variant="white">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-10">
          {[
            { icon: BookOpen, title: "Curriculum", desc: "A balanced blend of academic excellence and spiritual formation rooted in kingdom values." },
            { icon: Calendar, title: "School Calendar", desc: "Three terms per academic year with mid-term breaks and holiday programs available." },
            { icon: Phone, title: "Contact Admissions", desc: "Reach out to our admissions team for tours, fees, and enrollment information." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="text-center">
                <Icon className="mx-auto h-8 w-8 text-purple mb-3" />
                <h3 className="font-heading text-base font-bold text-slate">{item.title}</h3>
                <p className="mt-2 font-body text-sm text-gray-text">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      <SectionWrapper variant="off-white">
        <div className="mx-auto max-w-lg">
          <h2 className="font-heading text-[28px] font-bold text-slate text-center mb-6">Admission Inquiry</h2>
          {submitted ? (
            <div className="rounded-[8px] bg-success/10 border border-success/30 p-8 text-center">
              <Check className="mx-auto h-10 w-10 text-success mb-3" />
              <h3 className="font-heading text-lg font-bold text-success">Inquiry Submitted!</h3>
              <p className="mt-2 font-body text-sm text-gray-text">Our admissions team will contact you shortly.</p>
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => setSubmitted(false)}
              >
                Submit Another Inquiry
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input id="parentName" name="parentName" label="Parent / Guardian Name" placeholder="Full name" required />
              <Input id="email" name="email" label="Email" type="email" placeholder="you@example.com" required />
              <Input id="phone" name="phone" label="Phone" type="tel" placeholder="+234..." required />
              <Input id="childName" name="childName" label="Child's Name" placeholder="Full name" required />
              <Input id="childAge" name="childAge" label="Child's Age" type="number" min="2" max="12" placeholder="e.g. 5" required />
              <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
                {loading ? "Submitting..." : "Submit Inquiry"}
              </Button>
            </form>
          )}
        </div>
      </SectionWrapper>
    </>
  );
}
