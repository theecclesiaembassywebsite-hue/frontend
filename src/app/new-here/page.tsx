'use client';

import { useState } from 'react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/Motion';
import { MapPin, Clock, Shirt, Heart, CheckCircle } from 'lucide-react';
import { firstTimer } from '@/lib/api';

export default function NewHerePage() {
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    source: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await firstTimer.submitFirstTimer({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        source: formData.source || 'website',
      });
      setIsSuccess(true);
      success('Welcome! Thank you for sharing your details. We look forward to meeting you!');

      setTimeout(() => {
        setFormData({ fullName: '', email: '', phone: '', source: '' });
        setIsSuccess(false);
      }, 3000);
    } catch (err) {
      error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-4">
          <FadeIn>
            <h1 className="font-heading text-6xl md:text-7xl font-bold mb-4">
              Welcome to The Ecclesia Embassy
            </h1>
            <p className="font-body text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
              We're glad you're here
            </p>
          </FadeIn>
        </div>
      </section>

      {/* What to Expect Section */}
      <SectionWrapper variant="white" className="py-20">
        <FadeIn>
          <h2 className="font-heading text-4xl font-bold text-center mb-4" style={{ color: '#4A1D6E' }}>
            What to Expect
          </h2>
          <p className="font-body text-center text-gray-text mb-12 max-w-2xl mx-auto">
            We want you to feel comfortable from the moment you walk through our doors.
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Warm Welcome Card */}
          <StaggerItem>
            <div
              className="p-8 rounded-lg text-center transition-all duration-300 hover:shadow-lg"
              style={{ backgroundColor: '#E4E0EF' }}
            >
              <div className="flex justify-center mb-4">
                <Heart
                  size={40}
                  style={{ color: '#771996' }}
                />
              </div>
              <h3 className="font-heading text-lg font-bold mb-2" style={{ color: '#4A1D6E' }}>
                Warm Welcome
              </h3>
              <p className="font-body text-sm text-gray-text">
                You'll be greeted warmly by our community. We're here to make you feel at home.
              </p>
            </div>
          </StaggerItem>

          {/* Casual Dress Card */}
          <StaggerItem>
            <div
              className="p-8 rounded-lg text-center transition-all duration-300 hover:shadow-lg"
              style={{ backgroundColor: '#E4E0EF' }}
            >
              <div className="flex justify-center mb-4">
                <Shirt
                  size={40}
                  style={{ color: '#771996' }}
                />
              </div>
              <h3 className="font-heading text-lg font-bold mb-2" style={{ color: '#4A1D6E' }}>
                Casual Dress
              </h3>
              <p className="font-body text-sm text-gray-text">
                Come as you are. There's no dress code—just bring yourself and an open heart.
              </p>
            </div>
          </StaggerItem>

          {/* Service Times Card */}
          <StaggerItem>
            <div
              className="p-8 rounded-lg text-center transition-all duration-300 hover:shadow-lg"
              style={{ backgroundColor: '#E4E0EF' }}
            >
              <div className="flex justify-center mb-4">
                <Clock
                  size={40}
                  style={{ color: '#771996' }}
                />
              </div>
              <h3 className="font-heading text-lg font-bold mb-2" style={{ color: '#4A1D6E' }}>
                Service Times
              </h3>
              <p className="font-body text-sm text-gray-text">
                Sunday 8:00 AM. Join us for worship, community, and growth in faith.
              </p>
            </div>
          </StaggerItem>

          {/* Location Card */}
          <StaggerItem>
            <div
              className="p-8 rounded-lg text-center transition-all duration-300 hover:shadow-lg"
              style={{ backgroundColor: '#E4E0EF' }}
            >
              <div className="flex justify-center mb-4">
                <MapPin
                  size={40}
                  style={{ color: '#771996' }}
                />
              </div>
              <h3 className="font-heading text-lg font-bold mb-2" style={{ color: '#4A1D6E' }}>
                Location
              </h3>
              <p className="font-body text-sm text-gray-text">
                Abuja, Nigeria. Find us easily and start your journey with us today.
              </p>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </SectionWrapper>

      {/* First Timer Form Section */}
      <SectionWrapper variant="off-white" className="py-20">
        <FadeIn>
          <div className="max-w-xl mx-auto">
            {!isSuccess ? (
              <>
                <h2 className="font-heading text-4xl font-bold text-center mb-2" style={{ color: '#4A1D6E' }}>
                  Tell Us About Yourself
                </h2>
                <p className="font-body text-center text-gray-text mb-8">
                  Help us get to know you better so we can serve you more effectively.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />

                  <Input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />

                  <Input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />

                  <Select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    placeholder="How did you hear about us?"
                    options={[
                      { value: 'social-media', label: 'Social Media' },
                      { value: 'friend-family', label: 'Friend/Family' },
                      { value: 'website', label: 'Website' },
                      { value: 'walk-in', label: 'Walk-in' },
                      { value: 'other', label: 'Other' },
                    ]}
                    required
                  />

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                    style={{
                      backgroundColor: isLoading ? '#8A8A8E' : '#4A1D6E',
                    }}
                  >
                    {isLoading ? 'Submitting...' : 'Submit'}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <CheckCircle
                    size={64}
                    style={{ color: '#771996' }}
                  />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-2" style={{ color: '#4A1D6E' }}>
                  Welcome to our family!
                </h3>
                <p className="font-body text-gray-text">
                  Thank you for sharing your details. We look forward to meeting you on Sunday!
                </p>
              </div>
            )}
          </div>
        </FadeIn>
      </SectionWrapper>

      {/* New Convert CTA */}
      <SectionWrapper variant="dark-purple" className="py-16">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto">
            <Heart size={40} className="mx-auto mb-4 text-white/80" />
            <h2 className="font-heading text-3xl font-bold text-white mb-4">
              Just Gave Your Life to Christ?
            </h2>
            <p className="font-body text-white/80 mb-8">
              Congratulations! We want to walk with you on this new journey. Fill
              out our New Convert form so we can connect you to a growth track,
              a squad, and a community hub near you.
            </p>
            <a
              href="/new-here/new-convert"
              className="inline-flex items-center justify-center font-heading text-[13px] font-semibold uppercase tracking-[1.5px] leading-4 bg-white text-purple-dark hover:bg-off-white rounded-[4px] px-8 py-3 transition-all duration-200"
            >
              Start Your Journey
            </a>
          </div>
        </FadeIn>
      </SectionWrapper>
    </div>
  );
}
