"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionIntro from "@/components/ui/SectionIntro";
import Eyebrow from "@/components/ui/Eyebrow";
import MediaFrame from "@/components/ui/MediaFrame";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/Motion";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Music,
  Mic,
  Layers,
  Users,
  Palette,
  Film,
  Check,
  Phone,
  Mail,
  BookOpen,
  Zap,
  Star,
  ArrowDown,
  Drum,
  Sparkles,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react";
import { training, TrainingCourse } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

// Icons are a purely visual, code-driven lookup — new courses an admin creates
// later just fall back to the generic Sparkles icon.
const programIcons: Record<string, LucideIcon> = {
  IM: Music,
  VOICES: Mic,
  MCP: Layers,
  DANCE: Zap,
  MLT: Users,
  AD: Palette,
  SAL: Film,
};

const statusLabel: Record<TrainingCourse["status"], string> = {
  UPCOMING: "Upcoming",
  IN_SESSION: "Open",
  ENDED: "Not in Session",
};

const isJoinable = (course: TrainingCourse) =>
  course.registrationOpen && course.status === "IN_SESSION";

const experiences = [
  {
    icon: BookOpen,
    title: "Sound instruction from God's Word",
    desc: "Every lesson is anchored in scripture, forming the whole person — not just the musician.",
  },
  {
    icon: Star,
    title: "Lessons that meet you where you are",
    desc: "Easy to follow and designed to grow with you, no matter your starting level.",
  },
  {
    icon: Drum,
    title: "Go beyond excellence",
    desc: "Become a vessel of mastery in your instrument and craft — excellence is the floor, not the ceiling.",
  },
  {
    icon: Music,
    title: "Play in groups and orchestras",
    desc: "Bond with others and create powerful expressions in music, dance, and more through collaborative performance.",
  },
  {
    icon: Users,
    title: "Grow as a disciplined minister",
    desc: "Leave shaped as an intentional minister — not just a performer, but a carrier of sound with purpose.",
  },
];

const heroVideos = [
  { mobile: "/tema-hero-video-mobile.mp4", desktop: "/tema-hero-video.mp4" },
  { mobile: "/tema-hero-video-2-mobile.mp4", desktop: "/tema-hero-video-2.mp4" },
] as const;

const heroStats = [
  { value: "7+", label: "Program tracks" },
  { value: "Classical · Contemporary", label: "& Percussion streams" },
  { value: "All levels", label: "Beginners to advanced" },
];

export default function TEMAPage() {
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const [activeHeroSlot, setActiveHeroSlot] = useState<0 | 1>(0);
  // The second hero clip is another ~6MB and is not seen until the first one
  // ends, so it stays at `metadata` until the first is half-played. Warming it
  // then still leaves it fully buffered before the crossfade.
  const [secondClipWarmed, setSecondClipWarmed] = useState(false);
  const heroVideoRefA = useRef<HTMLVideoElement>(null);
  const heroVideoRefB = useRef<HTMLVideoElement>(null);
  const { success, error } = useToast();

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function heroVideoRef(slot: 0 | 1) {
    return slot === 0 ? heroVideoRefA : heroVideoRefB;
  }

  function toggleVideoSound() {
    const next = !videoMuted;
    if (heroVideoRefA.current) heroVideoRefA.current.muted = next;
    if (heroVideoRefB.current) heroVideoRefB.current.muted = next;
    setVideoMuted(next);
  }

  function playHeroSlot(slot: 0 | 1, muted: boolean) {
    const video = heroVideoRef(slot).current;
    if (!video) return;
    video.currentTime = 0;
    video.muted = muted;
    video.play().catch(() => {});
  }

  function warmSecondClip(e: React.SyntheticEvent<HTMLVideoElement>) {
    if (secondClipWarmed) return;
    const video = e.currentTarget;
    if (!video.duration || video.currentTime < video.duration / 2) return;
    setSecondClipWarmed(true);
    // Changing `preload` alone does not always restart buffering on an element
    // the browser has already settled; load() makes it explicit. Slot B has
    // never played, so there is no playback state to disturb.
    heroVideoRefB.current?.load();
  }

  function advanceHeroSlot(fromSlot: 0 | 1) {
    const finishedVideo = heroVideoRef(fromSlot).current;
    if (finishedVideo) finishedVideo.currentTime = 0;
    const nextSlot: 0 | 1 = fromSlot === 0 ? 1 : 0;
    setActiveHeroSlot(nextSlot);
    playHeroSlot(nextSlot, videoMuted);
  }

  // Try to start the hero video with sound; browsers that block unmuted
  // autoplay reject the play() promise, so fall back to muted playback.
  useEffect(() => {
    const video = heroVideoRefA.current;
    if (!video) return;
    video.muted = false;
    video.play()
      .then(() => setVideoMuted(false))
      .catch(() => {
        video.muted = true;
        setVideoMuted(true);
        video.play().catch(() => {});
      });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setCourses(await training.getCourses("TEMA"));
      } catch {
        error("Failed to load programs. Please refresh the page.");
      } finally {
        setCoursesLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await training.enrollTraining("TEMA", {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        courseId: formData.get("course") as string,
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
    <div data-brand="tema">
      {/* ── HERO ─────────────────────────────────────────────────────
          TEMA's opener is deliberately the most cinematic on the site:
          full-bleed motion, centred type, everything else stripped out. */}
      <section className="relative isolate overflow-hidden bg-[var(--brand-ink)] py-24 text-white md:py-32">
        <video
          ref={heroVideoRefA}
          playsInline
          preload="auto"
          poster="/site/tema-hero-poster.jpg"
          onTimeUpdate={warmSecondClip}
          onEnded={() => advanceHeroSlot(0)}
          className="absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: activeHeroSlot === 0 ? 0.6 : 0 }}
        >
          <source media="(max-width: 767px)" src={heroVideos[0].mobile} type="video/mp4" />
          <source src={heroVideos[0].desktop} type="video/mp4" />
        </video>
        <video
          ref={heroVideoRefB}
          playsInline
          preload={secondClipWarmed ? "auto" : "metadata"}
          onEnded={() => advanceHeroSlot(1)}
          className="absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: activeHeroSlot === 1 ? 0.6 : 0 }}
        >
          <source media="(max-width: 767px)" src={heroVideos[1].mobile} type="video/mp4" />
          <source src={heroVideos[1].desktop} type="video/mp4" />
        </video>

        <div aria-hidden="true" className="brand-photo-wash absolute inset-0 -z-10" />
        <div aria-hidden="true" className="brand-orb -left-32 top-16 h-72 w-72" />
        <div aria-hidden="true" className="brand-orb -right-24 bottom-0 h-80 w-80 opacity-80" />
        <div aria-hidden="true" className="brand-hairline absolute inset-x-0 top-0 h-px" />

        <button
          onClick={toggleVideoSound}
          aria-label={videoMuted ? "Unmute background video" : "Mute background video"}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white sm:right-6 sm:top-6"
        >
          {videoMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        <div className="relative mx-auto max-w-[1120px] px-4 text-center sm:px-6 md:px-8">
          <FadeIn direction="up">
            <Eyebrow align="center">The Ecclesia Music and Arts Academy</Eyebrow>
          </FadeIn>

          <FadeIn direction="up" delay={0.1}>
            <div className="mx-auto mt-8 max-w-[440px]">
              <Image
                src="/tema-academy-logo.png"
                alt="The Ecclesia Music and Arts Academy logo"
                width={488}
                height={423}
                loading="eager"
                fetchPriority="high"
                className="h-auto w-full object-contain drop-shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
              />
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.18}>
            <h1 className="mt-6 font-heading text-[52px] font-bold leading-[0.98] tracking-tight text-white md:text-7xl lg:text-[86px]">
              The Call
            </h1>
          </FadeIn>

          <FadeIn direction="up" delay={0.26}>
            <p className="mt-5 font-serif text-xl italic text-white/82 md:text-2xl">
              Where Spirit-led musicians are made
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.34}>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button variant="primary" onClick={() => scrollTo("enroll")}>
                Take the Step
              </Button>
              <Button variant="secondary" onDark onClick={() => scrollTo("programs")}>
                Explore Programs
              </Button>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.42}>
            <dl className="mx-auto mt-14 grid max-w-3xl gap-px overflow-hidden rounded-[26px] border border-white/10 bg-white/10 sm:grid-cols-3">
              {heroStats.map((stat) => (
                // The <dt> stays first in the DOM because that is what the
                // markup means; `order` flips it visually so the value reads
                // above its caption, which is how these were written —
                // "Classical · Contemporary" then "& Percussion streams".
                <div
                  key={stat.label}
                  className="flex flex-col bg-[var(--brand-ink)]/70 px-5 py-5 backdrop-blur-sm"
                >
                  <dt className="order-2 mt-2 font-body text-[11px] uppercase tracking-[0.2em] text-white/55">
                    {stat.label}
                  </dt>
                  <dd className="order-1 font-heading text-lg font-bold text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </FadeIn>

          <button
            onClick={() => scrollTo("manifesto")}
            aria-label="Scroll down"
            className="mx-auto mt-12 flex flex-col items-center gap-2 text-white/55 transition-colors hover:text-white/70"
          >
            <ArrowDown className="h-5 w-5 animate-bounce" />
          </button>
        </div>
      </section>

      {/* ── MANIFESTO ────────────────────────────────────────────────
          An editorial spread rather than a card grid — a standing photo
          against running prose, which is the shape TEMA owns on this site. */}
      <SectionWrapper variant="brand-ink" id="manifesto" hairline density="roomy">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[30px] border border-white/10">
              <Image
                src="/site/tema-orchestra.jpg"
                alt="TEMA string players performing together"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(21,8,7,0.82)_100%)]"
              />
              <p className="absolute inset-x-6 bottom-6 font-serif text-lg italic leading-8 text-white/90">
                &ldquo;This call takes students from mere interest to love, and from love to
                passion — for music does not truly produce until you are passionate.&rdquo;
              </p>
            </div>
          </div>

          <div>
            <Eyebrow>The Call</Eyebrow>
            <h2 className="mt-6 font-heading text-3xl font-bold leading-[1.1] tracking-tight text-white md:text-[46px]">
              Every generation carries a divine sound.
            </h2>

            <div className="mt-8 space-y-6 font-body text-[15px] leading-8 text-white/66 md:text-[17px]">
              <p>
                A summons to rise, rebuild, and restore God&apos;s order through music. The Ecclesia
                Music Academy stands as God&apos;s answer to this generation&apos;s longing for more
                than talent — a rising of Spirit-led musicians marked by fire, discipline, and
                excellence.
              </p>
              <p>
                This is not just another music school. It is a call — one that, when answered, ushers
                you into realms of grace and possibilities you never imagined.
              </p>
              <p className="font-serif text-xl italic text-white/85">
                If this stirs something within you… then this call is yours. Take the step today.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                { src: "/site/tema-bass.jpg", alt: "Bass player in rehearsal" },
                { src: "/site/tema-keys.jpg", alt: "Hands playing keys" },
              ].map((photo) => (
                <div
                  key={photo.src}
                  className="relative aspect-[16/10] overflow-hidden rounded-[22px] border border-white/10"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 30vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── ADVERT ── */}
      <SectionWrapper variant="brand-band" hairline>
        <div className="grid items-center gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
          <div>
            <Eyebrow>Welcome to TEMA</Eyebrow>
            <h2 className="mt-6 font-heading text-3xl font-bold leading-[1.1] text-white md:text-[42px]">
              Watch the academy at work.
            </h2>
            <p className="mt-5 font-body text-[15px] leading-8 text-white/66 md:text-base">
              A place to grow in skill, discipline, and spiritual depth — shaping musicians, artists,
              and ministers to carry sound with purpose and excellence.
            </p>
            <div className="mt-8">
              <Button variant="primary" onClick={() => scrollTo("programs")}>
                Explore TEMA Programs
              </Button>
            </div>
          </div>

          <MediaFrame glow badge="TEMA" caption="The Ecclesia Music and Arts Academy">
            <video
              className="h-full w-full object-cover"
              controls
              muted
              playsInline
              preload="metadata"
              poster="/tema-advert-poster.jpg"
              aria-label="TEMA advert"
            >
              <source src="/tema-advert.mp4" type="video/mp4" />
              Your browser does not support embedded video.
            </video>
          </MediaFrame>
        </div>
      </SectionWrapper>

      {/* ── THE YOU EXPERIENCE ───────────────────────────────────────
          A numbered rail. KISOLAM uses three-up tiles and EIS uses a photo
          grid, so the same content type reads differently on each page. */}
      <SectionWrapper variant="paper" id="experience">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <SectionIntro
              eyebrow="The You Experience"
              title="What to expect"
              description="Every session is designed to shape you inside and out. Our students don't just learn — they are transformed."
            />
          </div>

          <ol className="divide-y divide-slate/8 border-y border-slate/8">
            {experiences.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="py-7">
                  <FadeIn direction="up" delay={index * 0.05} className="flex gap-5 md:gap-7">
                    <div className="flex shrink-0 flex-col items-center gap-3">
                      <span className="font-heading text-[13px] font-bold tracking-[0.18em] text-[var(--brand-accent-text)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="brand-tile h-11 w-11">
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="pt-0.5">
                      <h3 className="font-heading text-lg font-bold leading-snug text-slate md:text-xl">
                        {item.title}
                      </h3>
                      <p className="mt-2.5 font-body text-sm leading-7 text-gray-text md:text-[15px]">
                        {item.desc}
                      </p>
                    </div>
                  </FadeIn>
                </li>
              );
            })}
          </ol>
        </div>
      </SectionWrapper>

      {/* ── PROGRAMS ── */}
      <SectionWrapper variant="white" id="programs">
        <SectionIntro
          align="center"
          eyebrow="Programs we offer"
          title="Designed to meet you at your level"
          description="Whether you're just beginning or stepping into mastery, there's a pathway here for you."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {coursesLoading ? (
            <SkeletonGroup count={6} variant="card" columns={2} className="md:col-span-2" />
          ) : courses.length === 0 ? (
            <p className="text-center font-body text-sm text-gray-text md:col-span-2">
              No programs are currently listed. Please check back soon.
            </p>
          ) : (
            courses.map((course) => {
              const Icon = programIcons[course.code] || Sparkles;
              const joinable = isJoinable(course);
              return (
                <div key={course.id} className="brand-card p-6 md:p-7">
                  <div className="flex items-start gap-5">
                    <div className="brand-tile h-12 w-12 shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[var(--brand-ink)] px-2.5 py-1 font-heading text-[9px] font-bold uppercase tracking-[0.16em] text-white">
                          {course.code}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 font-heading text-[9px] font-bold uppercase tracking-[0.16em] ${
                            joinable
                              ? "bg-success/10 text-success"
                              : "bg-gray-text/10 text-gray-text"
                          }`}
                        >
                          {statusLabel[course.status]}
                        </span>
                      </div>
                      <h3 className="mt-3 font-heading text-lg font-bold text-slate">
                        {course.name}
                      </h3>
                      <p className="mt-2 font-body text-sm leading-7 text-gray-text">
                        {course.description}
                      </p>
                      {course.streams.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {course.streams.map((s) => (
                            <span
                              key={s}
                              className="rounded-full border border-[var(--brand-accent-line)] bg-[var(--brand-accent-soft)] px-3 py-1 font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-slate"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p className="mt-10 text-center font-body text-sm italic text-gray-text">
          And much more programs… Program details will be announced across all platforms.
        </p>
      </SectionWrapper>

      {/* ── CONTACT & ENROLL ── */}
      <SectionWrapper
        variant="brand-ink"
        id="enroll"
        hairline
        backgroundImage="/site/tema-bass.jpg"
        backgroundPosition="center"
      >
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>If this stirs something within you…</Eyebrow>
            <h2 className="mt-6 font-heading text-3xl font-bold leading-[1.1] text-white md:text-[42px]">
              Then this call is yours.
            </h2>
            <p className="mt-5 font-body text-[15px] leading-8 text-white/66">
              Take the step today. Reach out to us directly, or fill in the form and we&apos;ll be in
              touch.
            </p>

            <div className="mt-9 space-y-4">
              <div className="brand-card-dark p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-accent-soft)]">
                    <Phone className="h-4 w-4 text-[var(--brand-accent-text)]" />
                  </div>
                  <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                    Phone
                  </p>
                </div>
                <div className="mt-3 space-y-1 pl-1">
                  <p className="font-body text-base font-medium text-white">+234 803 400 7867</p>
                  <p className="font-body text-base font-medium text-white">+234 806 120 9000</p>
                </div>
              </div>

              <div className="brand-card-dark p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-accent-soft)]">
                    <Mail className="h-4 w-4 text-[var(--brand-accent-text)]" />
                  </div>
                  <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                    Email
                  </p>
                </div>
                <p className="mt-3 break-all pl-1 font-body text-base font-medium text-white">
                  theecclesiamusicandarts@gmail.com
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/12 bg-[var(--brand-ink)]/72 p-6 backdrop-blur-md md:p-8">
            <h3 className="font-heading text-xl font-bold text-white">Register Your Interest</h3>
            <p className="mt-2 font-body text-sm text-white/55">
              Submit your details and we&apos;ll be in touch with next steps.
            </p>

            {enrolled ? (
              <div className="mt-7 rounded-[22px] border border-white/10 bg-white/8 p-8 text-center">
                <Check className="mx-auto mb-3 h-10 w-10 text-[var(--brand-accent-text)]" />
                <h4 className="font-heading text-lg font-bold text-white">You&apos;re Registered!</h4>
                <p className="mt-2 font-body text-sm text-white/65">
                  We&apos;ll reach out soon. Welcome to The Ecclesia Music and Arts Academy.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
                <Input id="name" name="name" placeholder="Full Name" required />
                <Input id="email" name="email" type="email" placeholder="Email Address" required />
                <Input id="phone" name="phone" type="tel" placeholder="Phone Number" required />
                <select
                  id="course"
                  name="course"
                  // The disabled first option is a placeholder, not a name —
                  // screen readers announced this control as unlabelled.
                  aria-label="Select a program"
                  required
                  defaultValue=""
                  className="w-full rounded-[8px] border-2 border-[#E8E6F0] bg-white px-4 py-2.5 font-body text-sm text-[#0E0B1E] transition-colors placeholder:text-[#8A8A90] focus:border-[#C9A84C] focus:outline-none"
                >
                  <option value="" disabled>
                    Select a program...
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id} disabled={!isJoinable(course)}>
                      {course.name}
                      {!isJoinable(course) ? ` (${statusLabel[course.status]})` : ""}
                    </option>
                  ))}
                </select>
                <Button type="submit" variant="giving" className="mt-1 w-full" disabled={loading}>
                  {loading ? "Submitting..." : "Take the Step"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
