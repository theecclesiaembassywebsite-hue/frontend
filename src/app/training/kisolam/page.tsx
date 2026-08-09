"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionIntro from "@/components/ui/SectionIntro";
import Eyebrow from "@/components/ui/Eyebrow";
import FeatureTile from "@/components/ui/FeatureTile";
import MediaFrame from "@/components/ui/MediaFrame";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import ProgramHero from "@/components/training/ProgramHero";
import { FadeIn } from "@/components/ui/Motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Calendar,
  GraduationCap,
  User,
} from "lucide-react";
import { training, TrainingCourse } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

const statusLabel: Record<TrainingCourse["status"], string> = {
  UPCOMING: "Upcoming",
  IN_SESSION: "Open for Enrollment",
  ENDED: "Not in Session",
};

const isJoinable = (course: TrainingCourse) =>
  course.registrationOpen && course.status === "IN_SESSION";

const formatFee = (course: TrainingCourse) => {
  if (course.feeType === "VARIABLE") return "Variable";
  return `${course.feeCurrency || "NGN "}${(course.fee || 0).toLocaleString()}`;
};

const trainingPillars = [
  {
    title: "Doctrine and Identity",
    desc: "Courses are built to establish a strong biblical foundation and kingdom consciousness.",
    icon: BookOpen,
  },
  {
    title: "Ministerial Training",
    desc: "Students are trained in service, leadership, and responsible ministry expression.",
    icon: GraduationCap,
  },
  {
    title: "Community Journey",
    desc: "Learning happens within a living community that encourages accountability and growth.",
    icon: User,
  },
];

const facultyRoles = ["Lead Faculty", "Associate Faculty", "Guest Faculty"];

const academicCalendar = [
  { title: "Session 1", detail: "January to June 2026" },
  { title: "Session 2", detail: "July to December 2026" },
  {
    title: "Application window",
    detail: "Closes two weeks before each session begins",
  },
];

export default function KISOLAMPage() {
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<"form" | "processing">("form");
  const [customAmount, setCustomAmount] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const { success, error } = useToast();

  useEffect(() => {
    (async () => {
      try {
        setCourses(await training.getCourses("KISOLAM"));
      } catch {
        error("Failed to load programs. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openEnroll(course: TrainingCourse) {
    setSelectedCourse(course);
    setFormData({ name: "", email: "", phone: "" });
    setCustomAmount("");
    setStep("form");
    setShowModal(true);
  }

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleEnrollAndPay(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourse) return;

    const amount = selectedCourse.feeType === "FIXED"
      ? selectedCourse.fee!
      : Number(customAmount);

    if (selectedCourse.feeType === "VARIABLE" && customAmount === "") {
      error("Please enter the program fee. Enter 0 for free sessions.");
      return;
    }

    if (selectedCourse.feeType === "VARIABLE" && amount < 0) {
      error("Amount cannot be negative.");
      return;
    }

    setStep("processing");
    try {
      const enrollment = await training.enrollTraining("KISOLAM", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        courseId: selectedCourse.id,
      });

      if (amount === 0) {
        success("Registration successful. Check your email for details.");
        setShowModal(false);
        window.location.href = `/training/kisolam/enrollment/${enrollment.id}`;
        return;
      }

      const payment = await training.initializePayment({
        enrollmentId: enrollment.id,
        amount,
        email: formData.email,
        name: formData.name,
        program: selectedCourse.name,
      });

      window.location.href = payment.authorization_url +
        `?callback_url=${encodeURIComponent(
          `${window.location.origin}/training/kisolam/enrollment/${enrollment.id}?ref=${payment.reference}`
        )}`;
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to process. Please try again.");
      setStep("form");
    }
  }

  return (
    <div data-brand="kisolam">
      <ProgramHero
        eyebrow="Kingdom Training"
        title="KISOLAM"
        subtitle="Kingdom International School of Life and Ministry"
        description="Equipping kingdom citizens for life, leadership, and ministry through structured training, doctrinal depth, and apostolic impartation."
        logoSrc="/kisolam-logo.png"
        logoAlt="KISOLAM"
        logoWidth={422}
        logoHeight={456}
        logoClassName="mx-auto max-w-[240px]"
        backgroundImage="/site/kisolam-graduation.jpg"
        backgroundPosition="center 30%"
        // No chips here on purpose. The three chips this hero used to carry
        // ("Foundational discipleship", "Leadership development", "Practical
        // ministry training") were the same three points the aside below makes
        // in full sentences, so the hero said everything twice. The aside wins:
        // it is more specific, and it gives the logo panel something to hold.
        aside={
          <div>
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
              Inside the school
            </p>
            <div className="mt-4 space-y-3">
              {[
                "Structured modules for doctrine, devotion, and kingdom service.",
                "Tracks that serve both entry-level learners and emerging leaders.",
                "Flexible options for intensive sessions and short workshops.",
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
        stats={[
          { value: String(courses.length || 5), label: "Program tracks" },
          { value: "Jan / Jul", label: "Session starts" },
          { value: "3–6 months", label: "Core duration" },
        ]}
        actions={
          <>
            <Button
              variant="primary"
              disabled={!courses.some(isJoinable)}
              onClick={() => {
                const first = courses.find(isJoinable);
                if (first) openEnroll(first);
              }}
            >
              Start Enrollment
            </Button>
            <Button variant="secondary" onDark onClick={() => scrollToSection("programs")}>
              Explore Programs
            </Button>
          </>
        }
      />

      {/* ── ADVERT ───────────────────────────────────────────────────
          Centred and full-width, unlike TEMA's side-by-side advert, so the
          two academies don't open into the same shape. */}
      <SectionWrapper variant="brand-band" hairline width="narrow">
        <SectionIntro
          align="center"
          tone="dark"
          eyebrow="Featured KISOLAM advert"
          title="See the school. Feel the calling."
          description="Take a closer look at the Kingdom International School of Life and Ministry and discover a training pathway built for depth, direction, and faithful service."
        />
        <div className="mt-12">
          <MediaFrame glow badge="KISOLAM">
            <video
              className="h-full w-full object-cover"
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/kisolam-advert-poster.jpg"
              aria-label="KISOLAM advert"
            >
              <source src="/kisolam-advert.mp4" type="video/mp4" />
              Your browser does not support embedded video. Please download the advert to watch it.
            </video>
          </MediaFrame>
        </div>
      </SectionWrapper>

      {/* ── PILLARS ── */}
      <SectionWrapper variant="white">
        <SectionIntro
          align="center"
          eyebrow="The KISOLAM model"
          title="A training pathway with depth and direction"
          description="KISOLAM is designed to move learners from conviction to competence — strengthening scriptural understanding, shaping character, and preparing people for faithful kingdom expression."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {trainingPillars.map((pillar, index) => (
            <FadeIn key={pillar.title} direction="up" delay={index * 0.06}>
              <FeatureTile
                icon={pillar.icon}
                title={pillar.title}
                description={pillar.desc}
              />
            </FadeIn>
          ))}
        </div>
      </SectionWrapper>

      {/* ── PROGRAMS ─────────────────────────────────────────────────
          Enrollable rows with a field-coloured spine on the left edge —
          the structural motif that belongs to KISOLAM. */}
      <SectionWrapper variant="paper" id="programs">
        <SectionIntro
          align="center"
          eyebrow="Programs offered"
          title="Choose your season of growth"
          description="Each pathway carries its own duration and fee. Pick the one that fits where you are, and enroll in a couple of steps."
        />

        <div className="mx-auto mt-14 max-w-4xl space-y-5">
          {loading ? (
            <SkeletonGroup count={5} variant="card" />
          ) : courses.length === 0 ? (
            <p className="text-center font-body text-sm text-gray-text">
              No programs are currently listed. Please check back soon.
            </p>
          ) : (
            courses.map((course) => {
              const joinable = isJoinable(course);
              return (
                <div
                  key={course.id}
                  className="brand-card relative overflow-hidden p-6 pl-8 md:p-7 md:pl-9"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-1.5"
                    style={{
                      background: joinable
                        ? "var(--brand-tile)"
                        : "rgba(138,138,144,0.25)",
                    }}
                  />
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[var(--brand-ink)] px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                          {course.code}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.16em] ${
                            joinable
                              ? "bg-success/10 text-success"
                              : "bg-gray-text/10 text-gray-text"
                          }`}
                        >
                          {statusLabel[course.status]}
                        </span>
                      </div>

                      <h3 className="mt-4 font-heading text-xl font-bold text-slate">
                        {course.name}
                      </h3>
                      <p className="mt-3 font-body text-sm leading-7 text-gray-text">
                        {course.description}
                      </p>

                      <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                        <div>
                          <dt className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-text">
                            Duration
                          </dt>
                          <dd className="mt-1 font-heading text-sm font-bold text-slate">
                            {course.duration}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-text">
                            Fee
                          </dt>
                          <dd className="mt-1 font-heading text-sm font-bold text-slate">
                            {formatFee(course)}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <Button
                      variant="primary"
                      className="shrink-0 text-sm"
                      disabled={!joinable}
                      onClick={() => openEnroll(course)}
                    >
                      {joinable ? (
                        <>
                          Enroll <ArrowRight size={14} />
                        </>
                      ) : (
                        statusLabel[course.status]
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SectionWrapper>

      {/* ── FACULTY + CALENDAR ── */}
      <SectionWrapper variant="white" id="calendar">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="brand-card brand-card--static p-6 md:p-8">
            <Eyebrow>Faculty support</Eyebrow>
            <h2 className="mt-5 font-heading text-[28px] font-bold leading-tight text-slate">
              Guided by seasoned voices
            </h2>
            <p className="mt-4 font-body text-sm leading-7 text-gray-text">
              KISOLAM faculty combines doctrinal strength, pastoral care, and practical ministry
              experience to guide learners with clarity and accountability.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {facultyRoles.map((role) => (
                <div
                  key={role}
                  className="rounded-[20px] border border-slate/8 bg-off-white p-5 text-center"
                >
                  <div className="brand-tile mx-auto h-12 w-12 !rounded-full">
                    <User className="h-5 w-5" />
                  </div>
                  <p className="mt-4 font-heading text-sm font-semibold text-slate">{role}</p>
                </div>
              ))}
            </div>

            <div className="relative mt-8 aspect-[16/8] overflow-hidden rounded-[20px] border border-slate/8">
              <Image
                src="/site/kisolam-graduation.jpg"
                alt="KISOLAM graduands at a commencement service"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[24px] bg-[image:var(--brand-band)] p-6 text-white shadow-[0_28px_70px_rgba(15,11,34,0.3)] md:p-8">
            <div aria-hidden="true" className="brand-orb -right-16 top-0 h-56 w-56" />
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="brand-tile h-12 w-12">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
                    Academic rhythm
                  </p>
                  <h2 className="font-heading text-[28px] font-bold text-white">2026 calendar</h2>
                </div>
              </div>

              <ol className="mt-9 space-y-0 border-l border-white/12 pl-7">
                {academicCalendar.map((item) => (
                  <li key={item.title} className="relative pb-8 last:pb-0">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[35px] top-1.5 h-3 w-3 rounded-full border-2 border-[var(--brand-ink)]"
                      style={{ background: "var(--brand-accent)" }}
                    />
                    <p className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand-accent-text)]">
                      {item.title}
                    </p>
                    <p className="mt-2 font-body text-sm leading-7 text-white/72">{item.detail}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <Modal
        isOpen={showModal}
        onClose={() => {
          if (step !== "processing") setShowModal(false);
        }}
        title={`Enroll - ${selectedCourse?.name || ""}`}
      >
        {step === "processing" ? (
          <div className="flex flex-col items-center justify-center gap-4 py-10">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple border-t-transparent" />
            <p className="font-body text-sm text-gray-text">Processing your enrollment...</p>
          </div>
        ) : (
          <form onSubmit={handleEnrollAndPay} className="space-y-4">
            <div className="rounded-[10px] bg-purple-light/40 px-4 py-3 text-sm">
              <p className="font-heading font-semibold text-slate">{selectedCourse?.name}</p>
              <p className="text-[12px] text-gray-text">Duration: {selectedCourse?.duration}</p>
              <p className="mt-1 font-heading text-[13px] font-bold text-purple">
                {selectedCourse?.feeType === "FIXED"
                  ? `Fee: ${selectedCourse?.feeCurrency}${(selectedCourse?.fee || 0).toLocaleString()}`
                  : "Fee varies per session. Enter the correct amount below."}
              </p>
            </div>

            <Input
              id="name"
              label="Full Name"
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              id="phone"
              label="Phone Number"
              type="tel"
              placeholder="+234..."
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />

            {selectedCourse?.feeType === "VARIABLE" && (
              <Input
                id="amount"
                label="Program Fee (NGN)"
                type="number"
                placeholder="Enter 0 for free, or the current session fee"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                required
                min="0"
              />
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="giving" className="flex-1 justify-center gap-2">
                <BadgeCheck size={15} />
                {selectedCourse?.feeType === "FIXED" || Number(customAmount) > 0
                  ? "Enroll and Pay"
                  : "Enroll Free"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
