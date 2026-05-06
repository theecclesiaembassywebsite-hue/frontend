"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { contact } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/Motion";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

// Form validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const ContactPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    try {
      await contact.submitContact(data);
      success("Message sent successfully! We'll get back to you soon.");
      reset();
    } catch (err) {
      error(
        err instanceof Error
          ? err.message
          : "Failed to send message. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-off-white">
      {/* Hero Section */}
      <section
        className="relative h-96 bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80')`,
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Hero content */}
        <div className="relative z-10 text-center text-white">
          <h1 className="font-heading text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="font-body text-lg text-off-white mb-6">
            We'd love to hear from you
          </p>
          {/* Decorative line */}
          <div className="w-16 h-1 bg-purple-vivid mx-auto" />
        </div>
      </section>

      {/* Main Content Section */}
      <SectionWrapper variant="white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Column */}
          <div className="lg:col-span-7">
            <FadeIn>
              <h2 className="font-heading text-3xl font-bold text-slate mb-2">
                Send us a Message
              </h2>
              <p className="text-gray-text mb-8 font-body">
                Fill out the form below and we'll get back to you as soon as
                possible.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block font-body text-sm font-medium text-slate mb-2">
                    Name
                  </label>
                  <Input
                    {...register("name")}
                    placeholder="Your name"
                    className={
                      errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-lavender focus:ring-purple"
                    }
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1 font-body">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block font-body text-sm font-medium text-slate mb-2">
                    Email
                  </label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="your@email.com"
                    className={
                      errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-lavender focus:ring-purple"
                    }
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 font-body">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Subject Field */}
                <div>
                  <label className="block font-body text-sm font-medium text-slate mb-2">
                    Subject
                  </label>
                  <Input
                    {...register("subject")}
                    placeholder="What is this about?"
                    className={
                      errors.subject
                        ? "border-red-500 focus:ring-red-500"
                        : "border-lavender focus:ring-purple"
                    }
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1 font-body">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label className="block font-body text-sm font-medium text-slate mb-2">
                    Message
                  </label>
                  <textarea
                    {...register("message")}
                    placeholder="Tell us more..."
                    rows={8}
                    className="w-full px-4 py-3 border-2 border-lavender rounded-lg font-body text-slate placeholder-gray-text focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-colors resize-none"
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1 font-body">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple hover:bg-purple-vivid text-white font-body font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </FadeIn>
          </div>

          {/* Contact Info Column */}
          <div className="lg:col-span-5">
            <FadeIn direction="left">
              <div className="bg-purple-dark rounded-xl p-8 text-white space-y-6">
                <h3 className="font-heading text-2xl font-bold">Contact Info</h3>

                {/* Address */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-body text-sm text-white/80 mb-1">
                      Location
                    </p>
                    <p className="font-body font-medium">
                      Sarki Tafida Street, Guzape Hills, Asokoro, Abuja
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="font-body text-sm text-white/80 mb-1">
                      Phone
                    </p>
                    <p className="font-body font-medium">+234 803 400 7867</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="font-body text-sm text-white/80 mb-1">
                      Email
                    </p>
                    <p className="font-body font-medium">
                      hello@theecclesia.org
                    </p>
                  </div>
                </div>

                {/* Service Times */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="font-body text-sm text-white/80 mb-1">
                      Service Times
                    </p>
                    <p className="font-body font-medium">
                      Sundays 8AM · Tuesdays & Fridays 5:30PM
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </SectionWrapper>

      {/* Map Section */}
      <SectionWrapper variant="off-white">
        <div className="mb-8">
          <h2 className="font-heading text-3xl font-bold text-slate mb-2">
            Find Us
          </h2>
          <p className="text-gray-text font-body">
            Sarki Tafida Street, Guzape Hills, Asokoro, Abuja, Nigeria
          </p>
        </div>

        <FadeIn>
          <div className="rounded-xl overflow-hidden shadow-lg h-[400px]">
            <iframe
              src="https://maps.google.com/maps?q=Sarki+Tafida+Street+Guzape+Hills+Asokoro+Abuja+Nigeria&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="The Ecclesia Embassy location"
            />
          </div>
        </FadeIn>
      </SectionWrapper>
    </main>
  );
};

export default ContactPage;
