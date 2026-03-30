'use client';

import { useState } from 'react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { cith } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { FadeIn } from '@/components/ui/Motion';
import { Home, CheckCircle } from 'lucide-react';

export default function RegisterHubPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    capacity: '',
    why: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { success, error } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await cith.registerEhub({
        name: formData.name,
        location: `${formData.address}, ${formData.city}`,
      });
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        capacity: '',
        why: '',
      });
      success('Thank you for registering your home as a CITH Hub!');
    } catch (err) {
      error('Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-80 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-purple-dark via-purple to-purple-vivid"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="relative z-10 text-center px-4">
          <div className="flex justify-center mb-4">
            <Home className="w-16 h-16 text-white drop-shadow-lg" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-white drop-shadow-md mb-4">
            Register Your Home as a Hub
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-body">
            Open your home to build kingdom community
          </p>
        </div>
      </section>

      {/* Registration Form */}
      <SectionWrapper variant="off-white">
        <FadeIn>
          <div className="max-w-2xl mx-auto">
            {isSuccess ? (
              <div className="bg-[#E4E0EF] border-2 border-[#27AE60] rounded-lg p-12 text-center">
                <CheckCircle className="w-16 h-16 text-[#27AE60] mx-auto mb-4" />
                <h2 className="text-3xl font-heading font-bold text-[#241A42] mb-2">
                  Thank you for registering!
                </h2>
                <p className="text-[#8A8A8E] font-body">
                  We're excited to have your home as part of the Ecclesia community. 
                  Our team will reach out soon to discuss next steps.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold font-heading text-[#241A42] mb-8 text-center">
                    Hub Registration Form
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(123) 456-7890"
                    required
                  />

                  <Input
                    label="City"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Your city"
                    required
                  />
                </div>

                <Input
                  label="Street Address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  required
                />

                <Input
                  label="Hub Capacity (number of people)"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="10"
                  required
                />

                <div>
                  <label className="block text-sm font-heading font-semibold text-[#241A42] mb-2">
                    Why do you want to host a CITH Hub?
                  </label>
                  <textarea
                    name="why"
                    value={formData.why}
                    onChange={handleInputChange}
                    placeholder="Tell us about your vision for community in your home..."
                    className="w-full px-4 py-3 border-2 border-[#E4E0EF] rounded-lg font-body text-[#31333B] focus:outline-none focus:border-[#771996] transition-colors bg-white resize-none h-32"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#771996] hover:bg-[#4A1D6E] text-white font-heading font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Registering...' : 'Register Hub'}
                </Button>
              </form>
            )}
          </div>
        </FadeIn>
      </SectionWrapper>
    </main>
  );
}
