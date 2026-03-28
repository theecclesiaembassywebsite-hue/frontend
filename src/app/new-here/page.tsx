"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { MapPin, Clock, Shirt, Heart } from "lucide-react";
import { useState } from "react";
import { firstTimer } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

const expectations = [
  {
    icon: Clock,
    title: "Service Flow",
    text: "Our services typically include praise and worship, prayer, the Word (teaching/preaching), and a time of fellowship. Expect an atmosphere filled with the presence of God.",
  },
  {
    icon: Shirt,
    title: "Dress Code",
    text: "Come as you are. We welcome everyone regardless of how you are dressed. We care more about your heart than your outfit.",
  },
  {
    icon: MapPin,
    title: "Location",
    text: "We are located in Abuja, Nigeria. Use the map below to find us, or join our online e-Hub from anywhere in the world.",
  },
  {
    icon: Heart,
    title: "What to Expect",
    text: "Warm, genuine fellowship. You will be welcomed, not overwhelmed. Our hospitality team will help you feel at home from the moment you walk in.",
  },
];

const sourceOptions = [
  { value: "social-media", label: "Social Media" },
  { value: "friend-family", label: "A Friend or Family Member" },
  { value: "online-search", label: "Online Search" },
  { value: "event", label: "Church Event" },
  { value: "walk-in", label: "Walk-in / Passerby" },
  { value: "other", label: "Other" },
];

export default function NewHerePage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const fullName = formData.get("name") as string;
      const [firstName, ...lastNameParts] = fullName.split(" ");
      const lastName = lastNameParts.join(" ") || "";

      await firstTimer.submitFirstTimer({
        firstName,
        lastName,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        address: formData.get("source") as string,
      });
      success("Thank you! We will reach out to you soon.");
      setSubmitted(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to submit. Please try again.");
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
            New Here?
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            Welcome home — we are so glad you found us
          </h6>
        </div>
      </section>

      {/* Welcome Message */}
      <SectionWrapper variant="white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-[28px] font-bold text-slate">
            Welcome from the Lead Brother
          </h2>
          <p className="mt-6 font-serif text-lg italic text-purple-vivid">
            &ldquo;We believe your visit is not by accident. God has a purpose
            for connecting you with this community. Whether you are seeking
            answers, looking for a spiritual family, or simply curious — you are
            welcome home.&rdquo;
          </p>
          <p className="mt-4 font-heading text-sm font-semibold text-slate">
            — Brother Victor Oluwadamilare, The Lead Brother
          </p>
        </div>
      </SectionWrapper>

      {/* What to Expect */}
      <SectionWrapper variant="off-white">
        <div className="text-center mb-10">
          <h2 className="font-heading text-[28px] font-bold text-slate">
            What to Expect
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {expectations.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-4 rounded-[8px] bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-light">
                  <Icon className="h-5 w-5 text-purple" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate">
                    {item.title}
                  </h3>
                  <p className="mt-1 font-body text-sm text-gray-text leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* First-Timer Registration Form */}
      <SectionWrapper variant="white">
        <div className="mx-auto max-w-lg">
          <div className="text-center mb-8">
            <h2 className="font-heading text-[28px] font-bold text-slate">
              Let Us Know You Visited
            </h2>
            <p className="mt-2 font-body text-sm text-gray-text">
              Fill out this quick form so we can welcome you properly and stay in touch.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-[8px] bg-success/10 border border-success/30 p-8 text-center">
              <h3 className="font-heading text-lg font-bold text-success">
                Thank you for visiting!
              </h3>
              <p className="mt-2 font-body text-sm text-gray-text">
                We have received your information and will be in touch soon. Check
                your email for a welcome message with service details.
              </p>
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => setSubmitted(false)}
              >
                Submit Another Form
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
                id="phone"
                name="phone"
                label="Phone Number"
                type="tel"
                placeholder="+234..."
                required
              />
              <Select
                id="source"
                name="source"
                label="How did you hear about us?"
                options={sourceOptions}
                placeholder="Select an option"
                defaultValue=""
                required
              />
              <Button type="submit" variant="primary" className="mt-2 w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </form>
          )}
        </div>
      </SectionWrapper>

      {/* Location Map */}
      <SectionWrapper variant="dark-slate">
        <div className="text-center mb-8">
          <h2 className="font-heading text-[28px] font-bold text-white">
            Find Us
          </h2>
        </div>
        <div className="aspect-video max-w-3xl mx-auto overflow-hidden rounded-[8px]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d252230.02028974562!2d7.247659799999999!3d9.0578964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e745f4cd62fd9%3A0x53bd17b4a20ea12b!2sAbuja%2C%20Federal%20Capital%20Territory%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1711500000000"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="The Ecclesia Embassy location in Abuja, Nigeria"
          />
        </div>
      </SectionWrapper>
    </>
  );
}
