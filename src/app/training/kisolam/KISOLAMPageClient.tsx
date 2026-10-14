"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionIntro from "@/components/ui/SectionIntro";
import Eyebrow from "@/components/ui/Eyebrow";
import FeatureTile from "@/components/ui/FeatureTile";
import MediaFrame from "@/components/ui/MediaFrame";
import Button from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import ProgramHero from "@/components/training/ProgramHero";
import FormRenderer, { type FormSubmission } from "@/components/forms/FormRenderer";
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
import { getCourseAvailability } from "@/lib/training-availability";
import { useToast } from "@/components/ui/Toast";
import { useRegistrationForm } from "@/lib/registration-form";

const isDtd = (course: TrainingCourse | null) => course?.code === "DTD";

const isJoinable = (course: TrainingCourse) =>
  getCourseAvailability(course).joinable;

// The backend computes the price (including any running discount) and sends it
// as `pricing`. Reading it here rather than re-deriving from fee/discount keeps
// the advertised figure and the charged figure identical by construction.
const formatFee = (course: TrainingCourse) => {
  const { pricing } = course;
  if (pricing.isFree) return "Free";
  return `${course.feeCurrency || "NGN "}${pricing.effectiveFee.toLocaleString()}`;
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

export default function KISOLAMPageClient() {
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<"form" | "processing">("form");
  // Set when a DTD registration was saved but its photo did not upload. A retry
  // must only re-send the photo: enrolling again would file a duplicate.
  const [savedEnrollment, setSavedEnrollment] = useState<{ id: string; photo: File } | null>(null);
  const [retryPhotoError, setRetryPhotoError] = useState("");
  const { success, error } = useToast();
  // The form belongs to the course being registered for. DTD must never fall back
  // to the plain form: without its photograph field the registration is never filed.
  const { config: form, status: formStatus } = useRegistrationForm("KISOLAM", selectedCourse?.id, {
    enabled: !!selectedCourse,
    fallback: !isDtd(selectedCourse),
  });

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
    setSavedEnrollment(null);
    setRetryPhotoError("");
    setStep("form");
    setShowModal(true);
  }

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleEnrollAndPay(r: FormSubmission) {
    if (!selectedCourse) return;

    // The enrollee no longer supplies an amount: the course's own price, and
    // any discount running against it, decide this. The backend recomputes it
    // regardless, so this only governs whether to show the payment step.
    const isFree = selectedCourse.pricing.isFree;

    setStep("processing");
    try {
      const enrollment = await training.enrollTraining("KISOLAM", {
        name: r.core.name ?? "",
        email: r.core.email ?? "",
        phone: r.core.phone ?? "",
        courseId: selectedCourse.id,
        additionalInfo: { custom: r.answers },
      });

      // KISOLAM fees are paid by bank transfer, not Paystack: the enrollment
      // page shows the account, the amount and the narration to use.
      success(
        isFree
          ? "Registration successful. Check your email for details."
          : "Registration received. Complete your fee by bank transfer."
      );
      setShowModal(false);
      window.location.href = `/training/kisolam/enrollment/${enrollment.id}`;
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to process. Please try again.");
      setStep("form");
    }
  }

  // DTD uses its own registration form. The answers ride along as
  // additionalInfo; the passport photo is sent once the enrollment exists, and
  // the backend files it in Drive and logs the row to the registration Sheet.
  async function handleDtdSubmit(r: FormSubmission) {
    if (!selectedCourse) return;
    const isFree = selectedCourse.pricing.isFree;
    // The photograph is the form's one file field.
    const photo = Object.values(r.files)[0];

    setStep("processing");
    try {
      const enrollment = await training.enrollTraining("KISOLAM", {
        name: r.core.name ?? "",
        email: r.core.email ?? "",
        phone: r.core.phone ?? "",
        courseId: selectedCourse.id,
        additionalInfo: { custom: r.answers },
      });

      try {
        if (!photo) throw new Error("Please upload your passport photograph.");
        await training.attachPassport(enrollment.id, photo);
      } catch (err) {
        // The enrollment exists but has no photo, and re-submitting the form
        // would create a duplicate. Keep the modal open on a retry panel that
        // re-sends only the photo.
        error(err instanceof Error ? err.message : "Photo upload failed.");
        setSavedEnrollment({ id: enrollment.id, photo });
        setStep("form");
        return;
      }

      finishDtd(enrollment.id, isFree);
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to process. Please try again.");
      setStep("form");
    }
  }

  function finishDtd(enrollmentId: string, isFree: boolean) {
    success(
      isFree
        ? "Registration successful. Check your email for details."
        : "Registration received. Complete your fee by bank transfer."
    );
    setShowModal(false);
    window.location.href = `/training/kisolam/enrollment/${enrollmentId}`;
  }

  async function handleRetryPhoto() {
    if (!savedEnrollment || !selectedCourse) return;
    setStep("processing");
    try {
      await training.attachPassport(savedEnrollment.id, savedEnrollment.photo);
      finishDtd(savedEnrollment.id, selectedCourse.pricing.isFree);
    } catch (err) {
      error(err instanceof Error ? err.message : "Photo upload failed. Please try again.");
      setStep("form");
    }
  }

  function replaceRetryPhoto(file: File | null) {
    setRetryPhotoError("");
    if (!file || !savedEnrollment) return;
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) {
      return setRetryPhotoError("Upload a JPG, PNG, WebP or PDF file.");
    }
    if (file.size > 10 * 1024 * 1024) return setRetryPhotoError("File is larger than 10 MB.");
    setSavedEnrollment({ ...savedEnrollment, photo: file });
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
              const availability = getCourseAvailability(course);
              const joinable = availability.joinable;
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
                          {availability.label}
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
                        availability.label
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
        ) : savedEnrollment ? (
          <div className="space-y-4">
            <div className="rounded-[10px] bg-purple-light/40 px-4 py-3 text-sm">
              <p className="font-heading font-semibold text-slate">Your details were saved</p>
              <p className="mt-1 text-[13px] text-gray-text">
                Your photograph did not upload. Retry below. You do not need to fill the form again.
              </p>
              <p className="mt-2 text-[12px] text-gray-text">
                Selected file: <strong>{savedEnrollment.photo.name}</strong>
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dtd-retry-photo" className="font-body text-sm font-medium text-slate">
                Use a different photograph (optional)
              </label>
              <input
                id="dtd-retry-photo"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => replaceRetryPhoto(e.target.files?.[0] ?? null)}
                className="font-body text-sm text-gray-text"
              />
              {retryPhotoError && <span className="font-body text-xs text-error">{retryPhotoError}</span>}
            </div>
            <p className="font-body text-xs text-gray-text">
              Still stuck? Email kisolam@theecclesiaembassy.org.
            </p>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button type="button" variant="giving" className="flex-1 justify-center" onClick={handleRetryPhoto}>
                Retry photo upload
              </Button>
            </div>
          </div>
        ) : isDtd(selectedCourse) ? (
          form ? (
            <FormRenderer
              key={selectedCourse?.id}
              config={form}
              top={
                <p className="font-heading text-[13px] font-bold text-purple">
                  {selectedCourse?.pricing.isFree
                    ? "Fee: Free — no payment required"
                    : `Fee: ${selectedCourse ? formatFee(selectedCourse) : ""} — paid by bank transfer after you register`}
                </p>
              }
              className="space-y-5"
              submitLabel={selectedCourse?.pricing.isFree ? "Register Free" : "Register"}
              submitIcon={<BadgeCheck size={15} />}
              submitVariant="giving"
              onCancel={() => setShowModal(false)}
              onSubmit={handleDtdSubmit}
            />
          ) : (
            <p className="py-6 text-center font-body text-sm text-gray-text">
              {formStatus === "error"
                ? "The registration form could not be loaded. Please refresh and try again."
                : "Loading the registration form..."}
            </p>
          )
        ) : form ? (
          <FormRenderer
            key={selectedCourse?.id}
            config={form}
            disabled={formStatus === "loading"}
            submitLabel={selectedCourse?.pricing.isFree ? "Enroll Free" : "Enroll"}
            submitIcon={<BadgeCheck size={15} />}
            submitVariant="giving"
            onCancel={() => setShowModal(false)}
            onSubmit={handleEnrollAndPay}
            top={
              <div className="rounded-[10px] bg-purple-light/40 px-4 py-3 text-sm">
                <p className="font-heading font-semibold text-slate">{selectedCourse?.name}</p>
                <p className="text-[12px] text-gray-text">Duration: {selectedCourse?.duration}</p>
                {selectedCourse?.pricing.isFree ? (
                  <p className="mt-1 font-heading text-[13px] font-bold text-purple">
                    Fee: Free — no payment required
                  </p>
                ) : (
                  <>
                    <p className="text-[12px] text-gray-text">Paid by bank transfer after you register.</p>
                    <p className="mt-1 font-heading text-[13px] font-bold text-purple">
                      Fee: {selectedCourse?.feeCurrency}
                      {selectedCourse?.pricing.effectiveFee.toLocaleString()}
                      {selectedCourse?.pricing.isDiscountActive && (
                        <span className="ml-2 font-body text-[12px] font-normal text-gray-text line-through">
                          {selectedCourse.feeCurrency}
                          {(selectedCourse.pricing.baseFee ?? 0).toLocaleString()}
                        </span>
                      )}
                    </p>
                    {selectedCourse?.pricing.isDiscountActive && (
                      <p className="text-[12px] text-purple">
                        {selectedCourse.pricing.activeDiscountPercent}% off
                        {selectedCourse.pricing.discountEndsAt
                          ? ` until ${new Date(selectedCourse.pricing.discountEndsAt).toLocaleDateString()}`
                          : ""}
                      </p>
                    )}
                  </>
                )}
              </div>
            }
          />
        ) : null}
      </Modal>
    </div>
  );
}
