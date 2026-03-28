"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { MapPin, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { contact } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await contact.submitContact({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        subject: formData.get("subject") as string,
        message: formData.get("message") as string,
      });
      success("Message sent successfully! We will get back to you soon.");
      setSubmitted(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
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
            Contact Us
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            We&apos;d love to hear from you
          </h6>
        </div>
      </section>

      <SectionWrapper variant="white">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <div>
            <h2 className="font-heading text-[28px] font-bold text-slate mb-6">
              Send Us a Message
            </h2>

            {submitted ? (
              <div className="rounded-[8px] bg-success/10 border border-success/30 p-8 text-center">
                <h3 className="font-heading text-lg font-bold text-success">
                  Message Sent!
                </h3>
                <p className="mt-2 font-body text-sm text-gray-text">
                  Thank you for reaching out. We will get back to you as soon as
                  possible.
                </p>
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  id="name"
                  name="name"
                  label="Full Name"
                  placeholder="Enter your full name"
                  required
                />
                <Input
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
                <Input
                  id="subject"
                  name="subject"
                  label="Subject"
                  placeholder="What is this about?"
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="message"
                    className="font-body text-sm font-medium text-slate"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    placeholder="Type your message here..."
                    className="w-full rounded-[4px] border border-gray-border bg-white px-4 py-3 font-body text-base text-slate placeholder:text-gray-text transition-colors duration-150 focus:border-purple-vivid focus:ring-3 focus:ring-purple-vivid/15 focus:outline-none resize-y"
                  />
                </div>
                <Button type="submit" variant="primary" className="mt-2 w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="font-heading text-[28px] font-bold text-slate mb-6">
              Get in Touch
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-light">
                  <MapPin className="h-5 w-5 text-purple" />
                </div>
                <div>
                  <h5 className="font-heading text-base font-bold text-slate">
                    Address
                  </h5>
                  <p className="mt-1 font-body text-sm text-gray-text">
                    The Ecclesia Embassy
                    <br />
                    Abuja, Federal Capital Territory
                    <br />
                    Nigeria
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-light">
                  <Phone className="h-5 w-5 text-purple" />
                </div>
                <div>
                  <h5 className="font-heading text-base font-bold text-slate">
                    Phone
                  </h5>
                  <p className="mt-1 font-body text-sm text-gray-text">
                    +234 XXX XXX XXXX
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-light">
                  <Mail className="h-5 w-5 text-purple" />
                </div>
                <div>
                  <h5 className="font-heading text-base font-bold text-slate">
                    Email
                  </h5>
                  <p className="mt-1 font-body text-sm text-gray-text">
                    info@theecclesiaembassy.org
                  </p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="mt-8 aspect-video overflow-hidden rounded-[8px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d252230.02028974562!2d7.247659799999999!3d9.0578964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e745f4cd62fd9%3A0x53bd17b4a20ea12b!2sAbuja%2C%20Federal%20Capital%20Territory%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1711500000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="The Ecclesia Embassy location"
              />
            </div>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
