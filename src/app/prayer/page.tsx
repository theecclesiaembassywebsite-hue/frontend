"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import { useState } from "react";
import { HandHeart } from "lucide-react";
import { prayer } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

export default function PrayerPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await prayer.submitPrayer({
        title: formData.get("name") as string,
        description: formData.get("request") as string,
        category: isPublic ? "public" : "private",
      });
      success("Prayer request submitted. Our team will pray with you.");
      setSubmitted(true);
      (e.target as HTMLFormElement).reset();
      setIsPublic(false);
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to submit prayer request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            Prayer Requests
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            Share your prayer needs with us — we stand with you in faith
          </h6>
        </div>
      </section>

      {/* Prayer Form */}
      <SectionWrapper variant="white">
        <div className="mx-auto max-w-lg">
          {submitted ? (
            <div className="rounded-[8px] bg-success/10 border border-success/30 p-8 text-center">
              <HandHeart className="mx-auto h-12 w-12 text-success mb-4" />
              <h3 className="font-heading text-xl font-bold text-success">
                Prayer Request Received
              </h3>
              <p className="mt-2 font-body text-sm text-gray-text">
                Our prayer team has received your request and will be lifting you
                up in prayer. You will receive a confirmation email shortly.
              </p>
              <Button
                variant="primary"
                className="mt-6"
                onClick={() => setSubmitted(false)}
              >
                Submit Another Request
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="font-heading text-[28px] font-bold text-slate">
                  Submit a Prayer Request
                </h2>
                <p className="mt-2 font-body text-sm text-gray-text">
                  You do not need an account to submit a prayer request. Our
                  prayer team will receive and pray over every request.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  id="name"
                  name="name"
                  label="Your Name"
                  placeholder="Enter your name"
                  required
                />
                <Input
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="request"
                    className="font-body text-sm font-medium text-slate"
                  >
                    Prayer Request
                  </label>
                  <textarea
                    id="request"
                    name="request"
                    rows={5}
                    required
                    placeholder="Share your prayer need here..."
                    className="w-full rounded-[4px] border border-gray-border bg-white px-4 py-3 font-body text-base text-slate placeholder:text-gray-text transition-colors duration-150 focus:border-purple-vivid focus:ring-3 focus:ring-purple-vivid/15 focus:outline-none resize-y"
                  />
                </div>
                <Checkbox
                  id="public"
                  label="Make this request visible to the community (public)"
                  checked={isPublic}
                  onChange={() => setIsPublic(!isPublic)}
                />
                {!isPublic && (
                  <p className="text-xs font-body text-gray-text -mt-2 ml-7">
                    Private requests are only visible to the prayer team.
                  </p>
                )}
                <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Prayer Request"}
                </Button>
              </form>
            </>
          )}
        </div>
      </SectionWrapper>

      {/* Scripture encouragement */}
      <SectionWrapper variant="dark-purple">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-serif text-xl italic text-white/90 leading-relaxed">
            &ldquo;Do not be anxious about anything, but in every situation, by
            prayer and petition, with thanksgiving, present your requests to God.
            And the peace of God, which transcends all understanding, will guard
            your hearts and your minds in Christ Jesus.&rdquo;
          </p>
          <p className="mt-4 font-heading text-sm font-semibold text-purple-light">
            — Philippians 4:6-7
          </p>
        </div>
      </SectionWrapper>
    </>
  );
}
