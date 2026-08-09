'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SectionWrapper from '@/components/ui/SectionWrapper';
import SectionIntro from '@/components/ui/SectionIntro';
import Eyebrow from '@/components/ui/Eyebrow';
import FeatureTile from '@/components/ui/FeatureTile';
import Button from '@/components/ui/Button';
import ProgramHero from '@/components/training/ProgramHero';
import { intentionalityClass } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';
import { FadeIn } from '@/components/ui/Motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  BookOpen,
  Check,
  CheckCircle,
  ClipboardList,
  Clock,
  GraduationCap,
  Lock,
  Sparkles,
  Users,
} from 'lucide-react';
import EditableContent from '@/components/ui/EditableContent';

interface Course {
  id: string;
  title: string;
  description: string;
  modules: Array<{ id: string; title: string; order: number }>;
  _count?: { enrollments: number };
}

interface UserEnrollment {
  id: string;
  status: string;
  course: { id: string; title: string };
}

function getPhaseNumber(title: string): number {
  if (/phase one/i.test(title)) return 1;
  if (/phase two/i.test(title)) return 2;
  if (/phase three/i.test(title)) return 3;
  return 0;
}

function getMaxAccessiblePhase(enrollments: UserEnrollment[]): number {
  const passed = (phase: number) =>
    enrollments.some((e) => getPhaseNumber(e.course.title) === phase && e.status === 'PASSED');
  if (passed(2)) return 3;
  if (passed(1)) return 2;
  return 1;
}

const journeyCards = [
  {
    icon: Clock,
    title: 'Paced growth',
    desc: 'A guided journey that helps learners move with intention instead of drifting through growth.',
  },
  {
    icon: BookOpen,
    title: 'Doctrinal grounding',
    desc: 'Foundational teaching clarifies faith, culture, and what it means to live kingdom values daily.',
  },
  {
    icon: Users,
    title: 'Community practice',
    desc: 'Growth is reinforced through accountability, interaction, and real ministry participation.',
  },
];

const outcomeCards = [
  {
    title: 'Foundation',
    desc: 'Strong roots in the Christian faith and a clear understanding of the Ecclesia Embassy system.',
  },
  {
    title: 'Transformation',
    desc: 'Character growth, discipline, and a healthy work culture for kingdom service and stewardship.',
  },
  {
    title: 'Responsibility',
    desc: 'Preparedness to serve, lead, and help others grow with maturity and clarity.',
  },
];

/**
 * One source of truth for the pathway. The old page described each phase
 * twice — once as a summary card, once again above its week breakdown — so
 * the two drifted apart. They are now a single timeline whose nodes open up
 * as the learner is cleared for them.
 */
const curriculum = [
  {
    phase: 1,
    title: 'Phase One — Move In',
    summary: 'The entry level introduces the basics of the Christian faith and the Ecclesia Embassy.',
    description:
      'Eight teachings spread across three weeks, or completed in a single one-day crash course.',
    available: true,
    weeks: [
      {
        week: 1,
        teachings: [
          { title: 'ORIENTATION / The History of The Called-Out Breed', isAssessment: false },
          { title: 'Understanding New Birth', isAssessment: false },
          { title: 'Knowledge of the Word', isAssessment: false },
        ],
      },
      {
        week: 2,
        teachings: [
          { title: 'Effective Prayer', isAssessment: false },
          { title: 'Holy Spirit', isAssessment: false },
        ],
      },
      {
        week: 3,
        teachings: [
          { title: 'The Ecclesia Embassy Experience 1', isAssessment: false },
          { title: 'CITH', isAssessment: false },
          { title: 'Assessment', isAssessment: true },
        ],
      },
    ],
  },
  {
    phase: 2,
    title: 'Phase Two — Maturity and Ministry',
    summary: 'Develops culture, consistency, honor, and stewardship.',
    description:
      'Teachings, assignments, evaluations, and hands-on service experiences across four weeks.',
    available: true,
    weeks: [
      {
        week: 1,
        sublevel: 'Maturity',
        teachings: [
          { title: 'Prayers / Discussion (10 mins)', isAssessment: false },
          { title: 'Stewardship', isAssessment: false },
          { title: 'Basics of Christianity', isAssessment: false },
          { title: 'Christian Conduct', isAssessment: false },
        ],
      },
      {
        week: 2,
        sublevel: 'Ministry',
        teachings: [
          { title: 'Prayers / Discussion (10 mins)', isAssessment: false },
          { title: 'Growing Up Spiritually', isAssessment: false },
          { title: 'Learning Scriptural Prayers & Pray in Tongues', isAssessment: false },
          { title: 'The Gospel of the Kingdom', isAssessment: false },
        ],
      },
      {
        week: 3,
        sublevel: 'Ministry',
        teachings: [
          { title: 'Prayers / Discussion (10 mins)', isAssessment: false },
          { title: 'Understanding Ministry', isAssessment: false },
          { title: 'The Ecclesia Experience 2', isAssessment: false },
          { title: 'The Ecclesia Experience 3', isAssessment: false },
        ],
      },
      {
        week: 4,
        sublevel: 'Ministry',
        teachings: [
          { title: 'Prayers / Discussion (10 mins)', isAssessment: false },
          { title: 'Homologia', isAssessment: false },
          { title: 'Learning How to Honour God, Themselves and People', isAssessment: false },
          { title: 'Continuous Assessment', isAssessment: true },
        ],
      },
    ],
  },
  {
    phase: 3,
    title: 'Phase Three — Missions and Mandate',
    summary: 'Shifts the focus from personal growth to kingdom impact.',
    description:
      'Prepares committed members for evangelism, leadership, and wider responsibility.',
    available: false,
    weeks: [],
  },
];

function IntentionalityClassContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<UserEnrollment[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [preferredFormat, setPreferredFormat] = useState('hybrid');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  useEffect(() => {
    intentionalityClass.getAvailableCourses()
      .then((data) => setCourses(data || []))
      .catch(() => {})
      .finally(() => setCoursesLoading(false));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      intentionalityClass.getMyCourses()
        .then((data) => setMyEnrollments(data || []))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const maxPhase = getMaxAccessiblePhase(myEnrollments);
  const accessibleCourses = courses.filter((c) => getPhaseNumber(c.title) <= maxPhase);

  useEffect(() => {
    if (accessibleCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(accessibleCourses[0].id);
    }
  }, [accessibleCourses, selectedCourseId]);

  const userName = user?.profile
    ? [user.profile.firstName, user.profile.lastName].filter(Boolean).join(' ')
    : '';

  const selectedCourse = courses.find((course) => course.id === selectedCourseId);

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isAuthenticated) {
      error('Please sign in to enroll in the Intentionality Class.');
      setIsLoading(false);
      return;
    }

    if (!selectedCourseId) {
      error('Please select a course to enroll in.');
      setIsLoading(false);
      return;
    }

    try {
      await intentionalityClass.enroll(selectedCourseId);
      setIsSuccess(true);
      success('Thank you for enrolling in the Intentionality Class.');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to enroll. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main data-brand="intentionality" className="min-h-screen">
      <ProgramHero
        eyebrow="Growth Pathway"
        title="The Intentionality Class"
        subtitle="Move-In · Maturity & Ministry · Missions & Mandate"
        description="A step-by-step journey that helps believers grow in faith, align with culture, and mature into service, stewardship, and leadership."
        logoSrc="/intentionality-class-logo.png"
        logoAlt="The Intentionality Class"
        logoWidth={1960}
        logoHeight={918}
        backgroundImage="/site/ic-teaching.jpg"
        backgroundPosition="center 25%"
        chips={[
          'Foundational faith',
          'Culture and stewardship',
          'Leadership development',
        ]}
        stats={[
          { value: '3', label: 'Phases' },
          { value: 'Hybrid', label: 'Delivery options' },
          { value: 'Step-by-step', label: 'Growth model' },
        ]}
        aside={
          <div>
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
              Pathway at a glance
            </p>
            <div className="mt-4 space-y-3">
              {[
                'Move-In introduces the foundations of faith and ministry culture.',
                'Maturity and Ministry develops stewardship, consistency, and service habits.',
                'Missions and Mandate prepares committed members for wider kingdom responsibility.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: 'var(--brand-accent)' }}
                  />
                  <p className="font-body text-sm leading-6 text-white/78">{item}</p>
                </div>
              ))}
            </div>
          </div>
        }
        actions={
          <>
            <Button variant="primary" onClick={() => scrollToSection('enroll')}>
              Enroll Now
            </Button>
            <Button variant="secondary" onDark onClick={() => scrollToSection('pathway')}>
              Explore the Pathway
            </Button>
          </>
        }
      />

      <EditableContent pagePath="/grow/intentionality-class" />

      {/* ── WHY THE CLASS EXISTS ── */}
      <SectionWrapper variant="white">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <FadeIn>
            <SectionIntro
              eyebrow="Built for purposeful growth"
              title="Growth that is chosen, not drifted into"
              description="The Intentionality Class is a foundational journey designed to help believers live with purpose and clarity. It strengthens spiritual foundation, shapes daily decisions, and forms a healthy rhythm of service and community."
            />
            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {outcomeCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-[18px] border border-slate/8 bg-off-white p-5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-accent-soft)]">
                    <Sparkles className="h-4 w-4 text-[var(--brand-accent-text)]" />
                  </div>
                  <h3 className="mt-4 font-heading text-sm font-bold text-slate">{card.title}</h3>
                  <p className="mt-2 font-body text-xs leading-6 text-gray-text">{card.desc}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[30px] border border-slate/8 shadow-[0_30px_70px_rgba(13,11,36,0.16)]">
              <Image
                src="/site/ic-teaching.jpg"
                alt="Teaching session at The Ecclesia Embassy"
                fill
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(13,11,36,0.72)_100%)]"
              />
              <p className="absolute inset-x-7 bottom-7 font-serif text-lg italic leading-8 text-white/92">
                From grounded faith, to a disciplined and service-driven life, to leadership and
                kingdom responsibility.
              </p>
            </div>
          </FadeIn>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {journeyCards.map((card, index) => (
            <FadeIn key={card.title} direction="up" delay={index * 0.06}>
              <FeatureTile icon={card.icon} title={card.title} description={card.desc} />
            </FadeIn>
          ))}
        </div>
      </SectionWrapper>

      {/* ── THE PATHWAY ──────────────────────────────────────────────
          A vertical spine with a gate per phase. This is the one page on
          the site whose structure has to show progression, so its central
          motif is a track rather than a grid. */}
      <SectionWrapper variant="brand-ink" id="pathway" hairline density="roomy">
        <SectionIntro
          align="center"
          tone="dark"
          eyebrow="The pathway"
          title="Three phases, opened one at a time"
          description="Each phase builds intentionally on the last. Complete the phase you are in and the next node on the track unlocks."
        />

        <div className="relative mx-auto mt-16 max-w-4xl">
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-[19px] top-2 w-px bg-white/12 md:left-[27px]"
          />

          <div className="space-y-8">
            {curriculum.map((phase) => {
              const unlocked = phase.phase <= maxPhase && phase.available;
              const lockLabel =
                phase.phase === 3 && !phase.available
                  ? 'Coming Soon'
                  : `Complete Phase ${phase.phase - 1} First`;

              return (
                <FadeIn key={phase.phase} direction="up" delay={0.06 * phase.phase}>
                  <div className="relative pl-14 md:pl-20">
                    {/* Node */}
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full border-2 md:h-14 md:w-14 ${
                        unlocked
                          ? 'border-transparent bg-[image:var(--brand-tile)] text-white'
                          : 'border-white/15 bg-[var(--brand-ink)] text-white/55'
                      }`}
                    >
                      {unlocked ? (
                        <Check className="h-4 w-4 md:h-5 md:w-5" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      )}
                    </span>

                    <div
                      className={`overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.05] backdrop-blur-sm ${
                        unlocked ? '' : 'opacity-70'
                      }`}
                    >
                      <div className="border-b border-white/8 px-6 py-6 md:px-8">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--brand-accent-text)]">
                              Stage {phase.phase}
                            </p>
                            <h3 className="mt-2 font-heading text-xl font-bold text-white md:text-2xl">
                              {phase.title}
                            </h3>
                            <p className="mt-3 max-w-xl font-body text-sm leading-7 text-white/64">
                              {phase.summary} {phase.description}
                            </p>
                          </div>
                          {!unlocked && (
                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/18 bg-white/8 px-3 py-1.5">
                              <Lock className="h-3.5 w-3.5 text-white/55" />
                              <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
                                {lockLabel}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      {unlocked && phase.weeks.length > 0 && (
                        <div
                          className={`grid gap-px bg-white/8 ${
                            phase.weeks.length === 4
                              ? 'sm:grid-cols-2 lg:grid-cols-4'
                              : 'sm:grid-cols-3'
                          }`}
                        >
                          {phase.weeks.map((week) => (
                            <div
                              key={week.week}
                              className="bg-[var(--brand-ink)]/85 px-6 py-6"
                            >
                              {'sublevel' in week && (
                                <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-accent-text)]">
                                  {week.sublevel}
                                </p>
                              )}
                              <p
                                className={`font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55 ${
                                  'sublevel' in week ? 'mt-1' : ''
                                }`}
                              >
                                Week {week.week}
                              </p>
                              <ul className="mt-4 space-y-3">
                                {week.teachings.map((teaching) => (
                                  <li key={teaching.title} className="flex items-start gap-3">
                                    {teaching.isAssessment ? (
                                      <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-accent-text)]" />
                                    ) : (
                                      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-white/55" />
                                    )}
                                    <span className="font-body text-[13px] leading-6 text-white/78">
                                      {teaching.title}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </SectionWrapper>

      {/* ── ENROLL ── */}
      <SectionWrapper variant="paper" id="enroll">
        <FadeIn>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative overflow-hidden rounded-[28px] bg-[image:var(--brand-band)] p-6 text-white shadow-[0_28px_70px_rgba(13,11,36,0.28)] md:p-8">
              <div aria-hidden="true" className="brand-orb -right-16 -top-10 h-56 w-56" />
              <div className="relative">
                <Eyebrow>Enrollment journey</Eyebrow>
                <h2 className="mt-5 font-heading text-[30px] font-bold leading-tight text-white md:text-[34px]">
                  Join the class with clarity
                </h2>
                <p className="mt-4 font-body text-sm leading-7 text-white/68 md:text-base">
                  Choose a course, select your preferred format, and continue your growth journey
                  from the dashboard once your enrollment is complete.
                </p>

                <ol className="mt-9 space-y-4">
                  {[
                    'Select the available course that fits your current cohort.',
                    'Choose whether you prefer in-person, online, or hybrid learning.',
                    'Access your course materials from the dashboard after enrollment.',
                  ].map((item, index) => (
                    <li
                      key={item}
                      className="flex items-start gap-4 rounded-[20px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-accent)] font-heading text-[11px] font-bold text-[var(--brand-on-accent)]">
                        {index + 1}
                      </span>
                      <p className="font-body text-sm leading-7 text-white/78">{item}</p>
                    </li>
                  ))}
                </ol>

                <div className="relative mt-8 aspect-[16/7] overflow-hidden rounded-[20px] border border-white/10">
                  <Image
                    src="/site/ic-nations.jpg"
                    alt="A globe on a study desk"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="brand-card brand-card--static p-6 md:p-8">
              <Eyebrow>Enroll now</Eyebrow>
              <h2 className="mt-5 font-heading text-[30px] font-bold text-slate md:text-[34px]">
                Start your phase
              </h2>
              <p className="mt-3 font-body text-sm leading-7 text-gray-text md:text-base">
                Join us on this transformative journey.
              </p>

              {isSuccess ? (
                <div className="mt-8 rounded-[24px] border border-success/30 bg-success/8 p-8 text-center">
                  <CheckCircle className="mx-auto h-14 w-14 text-success" />
                  <h3 className="mt-4 font-heading text-2xl font-bold text-slate">
                    Thank you for enrolling
                  </h3>
                  <p className="mt-3 font-body text-sm leading-7 text-gray-text">
                    You can now access your course materials from your dashboard.
                  </p>
                  <Link
                    href="/dashboard/class"
                    className="mt-6 inline-flex min-w-[180px] items-center justify-center rounded-full bg-[var(--brand-accent)] px-8 py-3 font-heading text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-on-accent)] transition-colors hover:bg-[var(--brand-accent-strong)]"
                  >
                    Go to My Courses
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  {isAuthenticated && user ? (
                    <div className="flex items-center gap-4 rounded-[16px] border border-slate/8 bg-off-white px-4 py-4">
                      <div className="brand-tile h-10 w-10 !rounded-full">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-text">
                          Enrolling as
                        </p>
                        <p className="mt-1 truncate font-heading text-sm font-bold text-slate">
                          {userName || user.email}
                        </p>
                        {userName ? (
                          <p className="truncate font-body text-xs text-gray-text">{user.email}</p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <label
                      htmlFor="ic-course"
                      className="mb-2 block font-heading text-sm font-semibold text-slate"
                    >
                      Preferred Course
                    </label>
                    {coursesLoading ? (
                      <div className="h-[46px] w-full animate-pulse rounded-lg bg-off-white" />
                    ) : accessibleCourses.length === 0 ? (
                      <p className="font-body text-sm italic text-gray-text">
                        No courses are available right now. Please check back later.
                      </p>
                    ) : (
                      <>
                        <select
                          id="ic-course"
                          value={selectedCourseId}
                          onChange={(e) => setSelectedCourseId(e.target.value)}
                          className="w-full rounded-lg border-2 border-gray-border bg-white px-4 py-2.5 font-body text-slate transition-colors focus:border-[var(--brand-accent)] focus:outline-none"
                          required
                        >
                          <option value="" disabled>
                            Select a course...
                          </option>
                          {accessibleCourses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.title} ({course.modules.length} modules)
                            </option>
                          ))}
                        </select>
                        {selectedCourse ? (
                          <p className="mt-3 font-body text-xs leading-6 text-gray-text">
                            {selectedCourse.description}
                          </p>
                        ) : null}
                        {maxPhase < 3 && (
                          <p className="mt-2 font-body text-xs text-gray-text">
                            Complete your current phase to unlock the next level.
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="ic-format"
                      className="mb-2 block font-heading text-sm font-semibold text-slate"
                    >
                      Preferred Format
                    </label>
                    <select
                      id="ic-format"
                      value={preferredFormat}
                      onChange={(e) => setPreferredFormat(e.target.value)}
                      className="w-full rounded-lg border-2 border-gray-border bg-white px-4 py-2.5 font-body text-slate transition-colors focus:border-[var(--brand-accent)] focus:outline-none"
                    >
                      <option value="in-person">In-Person</option>
                      <option value="online">Online</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || courses.length === 0}
                    className="w-full"
                  >
                    {isLoading ? 'Enrolling...' : 'Enroll Now'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </FadeIn>
      </SectionWrapper>
    </main>
  );
}

export default function IntentionalityClassPage() {
  return (
    <ProtectedRoute>
      <IntentionalityClassContent />
    </ProtectedRoute>
  );
}
