'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SectionWrapper from '@/components/ui/SectionWrapper';
import Button from '@/components/ui/Button';
import { intentionalityClass } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';
import { FadeIn } from '@/components/ui/Motion';
import { GraduationCap, CheckCircle, BookOpen, Clock, Users } from 'lucide-react';
import EditableContent from '@/components/ui/EditableContent';

interface Course {
  id: string;
  title: string;
  description: string;
  modules: Array<{ id: string; title: string; order: number }>;
  _count?: { enrollments: number };
}

export default function IntentionalityClassPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    intentionalityClass.getAvailableCourses()
      .then((data) => setCourses(data || []))
      .catch(() => {})
      .finally(() => setCoursesLoading(false));
  }, []);

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [preferredFormat, setPreferredFormat] = useState('hybrid');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  // Auto-select first course when courses load
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const userName = user?.profile
    ? [user.profile.firstName, user.profile.lastName].filter(Boolean).join(' ')
    : '';

  const handleSubmit = async (e: React.FormEvent) => {
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
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#241A42] to-[#4A1D6E]"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
        <div className="relative z-10 text-center px-4">
          <div className="flex justify-center mb-4">
            <GraduationCap className="w-16 h-16 text-[#E4E0EF]" />
          </div>
          <h1 className="text-5xl font-bold font-heading text-white mb-4">Intentionality Class</h1>
          <p className="text-xl text-[#E4E0EF]">A foundational journey into kingdom living</p>
        </div>
      </section>

      <EditableContent pagePath="/grow/intentionality-class" />

      {/* About the Class */}
      <SectionWrapper variant="white">
        <FadeIn>
          <div className="mb-12">
            <h2 className="text-4xl font-bold font-heading text-[#241A42] mb-8 text-center">
              About the Class
            </h2>
            <p className="text-lg text-[#8A8A8E] font-body max-w-3xl mx-auto mb-12 text-center">
              The Intentionality Class is a foundational journey designed to help you live with purpose
              and clarity. Over six weeks, we explore what it means to align your daily decisions with
              kingdom values, deepen your spiritual foundation, and build meaningful community with
              others on the same journey.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Duration Card */}
              <FadeIn delay={0.1}>
                <div className="bg-[#F5F5F5] rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
                  <Clock className="w-12 h-12 text-[#771996] mx-auto mb-4" />
                  <h3 className="text-xl font-heading font-semibold text-[#241A42] mb-2">Duration</h3>
                  <p className="text-[#8A8A8E] font-body">6 weeks of transformative learning</p>
                </div>
              </FadeIn>

              {/* Format Card */}
              <FadeIn delay={0.2}>
                <div className="bg-[#F5F5F5] rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
                  <BookOpen className="w-12 h-12 text-[#771996] mx-auto mb-4" />
                  <h3 className="text-xl font-heading font-semibold text-[#241A42] mb-2">Format</h3>
                  <p className="text-[#8A8A8E] font-body">In-person and online options available</p>
                </div>
              </FadeIn>

              {/* Community Card */}
              <FadeIn delay={0.3}>
                <div className="bg-[#F5F5F5] rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
                  <Users className="w-12 h-12 text-[#771996] mx-auto mb-4" />
                  <h3 className="text-xl font-heading font-semibold text-[#241A42] mb-2">Community</h3>
                  <p className="text-[#8A8A8E] font-body">Small groups for meaningful connection</p>
                </div>
              </FadeIn>
            </div>
          </div>
        </FadeIn>
      </SectionWrapper>

      {/* Intentionality Class Details */}
      <SectionWrapper variant="white">
        <FadeIn>
          <div className="max-w-5xl mx-auto mb-12">
            <h2 className="text-4xl font-bold font-heading text-[#241A42] mb-8 text-center">
              What the Intentionality Class is About
            </h2>
            <div className="space-y-6 font-body text-[#4E4B6C] leading-relaxed text-base">
              <p>
                The Intentionality Class is the core training and development pathway of The Ecclesia Embassy, designed to intentionally guide believers from foundational faith to active service and leadership within the ministry. It is a structured system that ensures every partaker is grounded spiritually, aligned culturally, and equipped to fulfill their role in the Ecclesia mandate.
              </p>
              <p>
                At its core, the Intentionality Class is about intentional growth; raising individuals who not only understand their faith but also live it out through service, stewardship, and leadership.
              </p>

              <div className="rounded-[20px] border border-[#E4E0EF] bg-[#F7F5FF] p-6">
                <h3 className="text-2xl font-semibold text-[#241A42] mb-4">The program focuses on three key outcomes:</h3>
                <ul className="space-y-4 list-disc list-inside font-body text-[#4E4B6C]">
                  <li>
                    <span className="font-semibold">Foundation:</span> Establishing strong roots in the Christian faith and understanding the Ecclesia Embassy system.
                  </li>
                  <li>
                    <span className="font-semibold">Transformation:</span> Developing godly character, discipline, and the work culture required for kingdom service.
                  </li>
                  <li>
                    <span className="font-semibold">Responsibility:</span> Raising individuals who are equipped to serve, lead, and help others grow.
                  </li>
                </ul>
              </div>

              <p>
                It moves partakers from being learners to becoming active contributors and eventually leaders within the Ecclesia Workforce.
              </p>

              <h3 className="text-3xl font-semibold text-[#241A42] mt-8">The Process</h3>
              <div className="space-y-8">
                <div>
                  <h4 className="text-2xl font-semibold text-[#241A42] mb-2">Phase One — Move-In</h4>
                  <p>
                    This is the entry level where partakers are introduced to the basics of the Christian faith and the Ecclesia Embassy. It includes six teachings and can be completed over three weeks or through a one-day crash course. At the end, partakers are assessed and qualified candidates move to the next phase.
                  </p>
                </div>
                <div>
                  <h4 className="text-2xl font-semibold text-[#241A42] mb-2">Phase Two — Maturity & Ministry</h4>
                  <p>
                    This phase focuses on practical growth and culture development. Over several weeks, partakers are trained in values such as stewardship, consistency, honour, and commitment through teachings, assignments, and evaluations.
                  </p>
                  <p>
                    A major component here is the Ecclesia Stewardship Experience Program (ESEP), a hands-on internship where partakers serve in different ministry platforms to gain real experience. Successful partakers are then integrated into the Ecclesia Workforce.
                  </p>
                </div>
                <div>
                  <h4 className="text-2xl font-semibold text-[#241A42] mb-2">Phase Three — Missions & Mandate</h4>
                  <p>
                    This is the advanced stage for committed members and leaders. It shifts the focus from personal growth to kingdom impact. Partakers are trained in evangelism (Missions) and leadership (Mandate), equipping them to influence others and take on greater responsibility within and beyond the ministry.
                  </p>
                </div>
              </div>

              <p className="font-semibold">
                The Intentionality Class is a step-by-step journey of transformation; from becoming grounded in faith, to living a disciplined and service-driven life, and ultimately to embracing leadership and kingdom responsibility. It ensures that every member of The Ecclesia Embassy is intentionally built to grow, serve, and lead.
              </p>
            </div>
          </div>
        </FadeIn>
      </SectionWrapper>

      {/* Enrollment Form */}
      <SectionWrapper variant="off-white">
        <FadeIn>
          <div className="max-w-xl mx-auto">
            <h2 className="text-4xl font-bold font-heading text-[#241A42] mb-2 text-center">
              Enroll Now
            </h2>
            <p className="text-[#8A8A8E] font-body text-center mb-8">
              Join us on this transformative journey
            </p>

            {isSuccess ? (
              <div className="bg-[#E4E0EF] border-2 border-[#27AE60] rounded-lg p-8 text-center">
                <CheckCircle className="w-16 h-16 text-[#27AE60] mx-auto mb-4" />
                <h3 className="text-2xl font-heading font-bold text-[#241A42] mb-2">
                  Thank you for enrolling!
                </h3>
                <p className="text-[#8A8A8E] font-body mb-6">
                  You can now access your course materials from your dashboard.
                </p>
                <Link
                  href="/dashboard/class"
                  className="inline-block bg-[#771996] hover:bg-[#4A1D6E] text-white font-heading font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Go to My Courses
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Show logged-in user info */}
                {isAuthenticated && user && (
                  <div className="rounded-[8px] bg-[#F5F5F5] border border-[#E4E0EF] px-4 py-3">
                    <p className="font-heading text-xs font-semibold text-[#8A8A8E] uppercase tracking-wide mb-1">
                      Enrolling as
                    </p>
                    <p className="font-heading text-sm font-bold text-[#241A42]">
                      {userName || user.email}
                    </p>
                    {userName && (
                      <p className="font-body text-xs text-[#8A8A8E]">{user.email}</p>
                    )}
                  </div>
                )}

                {/* Course Dropdown */}
                <div>
                  <label className="block text-sm font-heading font-semibold text-[#241A42] mb-2">
                    Preferred Course
                  </label>
                  {coursesLoading ? (
                    <div className="w-full h-[42px] rounded-lg bg-[#F5F5F5] animate-pulse" />
                  ) : courses.length === 0 ? (
                    <p className="font-body text-sm text-[#8A8A8E] italic">
                      No courses available at this time. Please check back later.
                    </p>
                  ) : (
                    <>
                      <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-[#E4E0EF] rounded-lg font-body text-[#31333B] focus:outline-none focus:border-[#771996] transition-colors bg-white"
                        required
                      >
                        <option value="" disabled>Select a course…</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title} ({course.modules.length} modules)
                          </option>
                        ))}
                      </select>
                      {/* Show selected course description */}
                      {selectedCourseId && (() => {
                        const selected = courses.find((c) => c.id === selectedCourseId);
                        return selected ? (
                          <p className="mt-2 font-body text-xs text-[#8A8A8E] leading-relaxed">
                            {selected.description}
                          </p>
                        ) : null;
                      })()}
                    </>
                  )}
                </div>

                {/* Preferred Format Dropdown */}
                <div>
                  <label className="block text-sm font-heading font-semibold text-[#241A42] mb-2">
                    Preferred Format
                  </label>
                  <select
                    value={preferredFormat}
                    onChange={(e) => setPreferredFormat(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-[#E4E0EF] rounded-lg font-body text-[#31333B] focus:outline-none focus:border-[#771996] transition-colors bg-white"
                  >
                    <option value="in-person">In-Person</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || courses.length === 0}
                  className="w-full bg-[#771996] hover:bg-[#4A1D6E] text-white font-heading font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Enrolling...' : 'Enroll Now'}
                </Button>

                {!isAuthenticated && (
                  <p className="text-center text-sm text-[#8A8A8E] font-body mt-4">
                    You need to{' '}
                    <Link href="/auth/login" className="text-[#771996] hover:underline font-semibold">
                      sign in
                    </Link>{' '}
                    to enroll in this class.
                  </p>
                )}
              </form>
            )}
          </div>
        </FadeIn>
      </SectionWrapper>
    </main>
  );
}
