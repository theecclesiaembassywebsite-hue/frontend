'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SectionWrapper from '@/components/ui/SectionWrapper';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { intentionalityClass } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';
import { FadeIn } from '@/components/ui/Motion';
import { GraduationCap, CheckCircle, BookOpen, Clock, Users } from 'lucide-react';

export default function IntentionalityClassPage() {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    intentionalityClass.getAvailableCourses()
      .then((data) => setCourses(data || []))
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredFormat: 'hybrid',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isAuthenticated) {
      error('Please sign in to enroll in the Intentionality Class.');
      return;
    }

    try {
      const courseId = courses.length > 0 ? courses[0].id : null;
      if (!courseId) {
        error('No courses available at this time. Please check back later.');
        setIsLoading(false);
        return;
      }
      await intentionalityClass.enroll(courseId);
      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', preferredFormat: 'hybrid' });
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
                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  required
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                />

                <Input
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(123) 456-7890"
                  required
                />

                <div>
                  <label className="block text-sm font-heading font-semibold text-[#241A42] mb-2">
                    Preferred Format
                  </label>
                  <select
                    name="preferredFormat"
                    value={formData.preferredFormat}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-[#E4E0EF] rounded-lg font-body text-[#31333B] focus:outline-none focus:border-[#771996] transition-colors bg-white"
                  >
                    <option value="in-person">In-Person</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
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
