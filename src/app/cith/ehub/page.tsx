"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { cith } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

export default function EHubPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await cith.registerEhub({
        name: formData.get("name") as string,
        location: formData.get("location") as string,
      });
      success("Welcome to the e-Hub! Check your email for meeting details.");
      setSubmitted(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="relative flex items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            Join the e-Hub
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            Online fellowship from anywhere in the world
          </h6>
        </div>
      </section>

      <SectionWrapper variant="white">
        <div className="mx-auto max-w-lg">
          <div className="text-center mb-8">
            <Globe className="mx-auto h-12 w-12 text-purple mb-3" />
            <h2 className="font-heading text-[28px] font-bold text-slate">
              e-Hub Registration
            </h2>
            <p className="mt-2 font-body text-sm text-gray-text">
              No physical hub nearby? Join our online community and participate
              in virtual fellowship meetings from anywhere.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-[8px] bg-success/10 border border-success/30 p-8 text-center">
              <Check className="mx-auto h-10 w-10 text-success mb-3" />
              <h3 className="font-heading text-lg font-bold text-success">
                Registration Successful!
              </h3>
              <p className="mt-2 font-body text-sm text-gray-text">
                Check your email for your virtual meeting schedule and links.
                Welcome to the e-Hub community!
              </p>
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => setSubmitted(false)}
              >
                Register Another Person
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input id="name" name="name" label="Full Name" placeholder="Enter your full name" required />
              <Input id="email" name="email" label="Email Address" type="email" placeholder="you@example.com" required />
              <Input id="phone" name="phone" label="Phone Number" type="tel" placeholder="+234..." required />
              <Input id="location" name="location" label="Your Location (City, Country)" placeholder="e.g. Lagos, Nigeria" required />
              <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
                {loading ? "Joining..." : "Join the e-Hub"}
              </Button>
            </form>
          )}
        </div>
      </SectionWrapper>
    </>
  );
}
