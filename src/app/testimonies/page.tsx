"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { Quote, ChevronDown, ChevronUp, PenLine } from "lucide-react";
import { testimonies, type Testimony } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";

function TestimonyCard({
  title,
  content,
  createdAt,
}: {
  title: string;
  content: string;
  createdAt: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
      <Quote className="h-6 w-6 text-purple-vivid mb-2" />
      <h3 className="font-heading text-lg font-bold text-slate">{title}</h3>
      <p className="text-body-small mt-1">{date}</p>
      <p
        className={`mt-3 font-serif text-base italic text-gray-text leading-relaxed ${
          !expanded ? "line-clamp-3" : ""
        }`}
      >
        &ldquo;{content}&rdquo;
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 inline-flex items-center gap-1 text-xs font-heading font-semibold uppercase tracking-wider text-purple-vivid hover:underline"
      >
        {expanded ? (
          <>
            Read Less <ChevronUp size={14} />
          </>
        ) : (
          <>
            Read More <ChevronDown size={14} />
          </>
        )}
      </button>
    </div>
  );
}

export default function TestimoniesPage() {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loadingTestimonies, setLoadingTestimonies] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [approvedTestimonies, setApprovedTestimonies] = useState<Testimony[]>([]);
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();

  useEffect(() => {
    fetchTestimonies();
  }, []);

  async function fetchTestimonies() {
    try {
      setLoadingTestimonies(true);
      const data = await testimonies.getTestimonies();
      setApprovedTestimonies(data);
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to load testimonies.");
    } finally {
      setLoadingTestimonies(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isAuthenticated) {
      error("Please log in to share your testimony.");
      return;
    }

    setLoadingSubmit(true);

    try {
      const formData = new FormData(e.currentTarget);
      await testimonies.submitTestimony({
        title: formData.get("title") as string,
        content: formData.get("testimony") as string,
      });
      success("Testimony submitted for review. Thank you for sharing!");
      setSubmitted(true);
      setShowForm(false);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to submit testimony. Please try again.");
    } finally {
      setLoadingSubmit(false);
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
            Testimonies
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            See what God is doing in the lives of His people
          </h6>
        </div>
      </section>

      {/* Submit CTA */}
      <SectionWrapper variant="lavender">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="font-heading text-xl font-bold text-slate">
              Share Your Testimony
            </h2>
            <p className="mt-1 font-body text-sm text-gray-text">
              Has God done something amazing in your life? Share it to encourage
              others.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowForm(!showForm)}
            className="shrink-0"
          >
            <PenLine size={16} className="mr-2" />
            {showForm ? "Close Form" : "Share Your Testimony"}
          </Button>
        </div>

        {/* Submission Form */}
        {showForm && (
          <div className="mt-8 mx-auto max-w-lg">
            {!isAuthenticated ? (
              <div className="rounded-[8px] bg-warning/10 border border-warning/30 p-6 text-center">
                <p className="font-body text-sm text-gray-text mb-4">
                  You must be logged in to share your testimony.
                </p>
                <a href="/auth/login" className="text-purple-vivid font-heading font-semibold hover:underline">
                  Log in to continue
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-[8px] bg-white p-6 shadow-sm">
                <h3 className="font-heading text-lg font-bold text-slate">
                  Submit a Testimony
                </h3>
                <p className="font-body text-xs text-gray-text -mt-2">
                  Your testimony will be reviewed before being published.
                </p>
                <Input
                  id="title"
                  name="title"
                  label="Title"
                  placeholder="Give your testimony a title"
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="testimony"
                    className="font-body text-sm font-medium text-slate"
                  >
                    Your Testimony
                  </label>
                  <textarea
                    id="testimony"
                    name="testimony"
                    rows={6}
                    required
                    placeholder="Share what God has done..."
                    className="w-full rounded-[4px] border border-gray-border bg-white px-4 py-3 font-body text-base text-slate placeholder:text-gray-text transition-colors duration-150 focus:border-purple-vivid focus:ring-3 focus:ring-purple-vivid/15 focus:outline-none resize-y"
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full" disabled={loadingSubmit}>
                  {loadingSubmit ? "Submitting..." : "Submit for Review"}
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Submission success */}
        {submitted && !showForm && (
          <div className="mt-6 rounded-[8px] bg-success/10 border border-success/30 p-4 text-center">
            <p className="font-heading text-sm font-semibold text-success">
              Your testimony has been submitted for review. Thank you for sharing!
            </p>
          </div>
        )}
      </SectionWrapper>

      {/* Testimony Wall */}
      <SectionWrapper variant="white">
        <div className="text-center mb-10">
          <h2 className="font-heading text-[28px] font-bold text-slate">
            Testimony Wall
          </h2>
          <p className="mt-2 font-serif text-lg italic text-gray-text">
            Be encouraged by what God is doing
          </p>
        </div>

        {loadingTestimonies ? (
          <div className="text-center py-8">
            <p className="font-body text-sm text-gray-text">Loading testimonies...</p>
          </div>
        ) : approvedTestimonies.length === 0 ? (
          <div className="rounded-[8px] bg-off-white p-8 text-center">
            <p className="font-body text-sm text-gray-text">
              No testimonies yet. Be the first to share your story!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {approvedTestimonies.map((t) => (
              <TestimonyCard key={t.id} title={t.title} content={t.content} createdAt={t.createdAt} />
            ))}
          </div>
        )}
      </SectionWrapper>
    </>
  );
}
