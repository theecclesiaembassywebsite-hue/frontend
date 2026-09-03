"use client";

import PageHero from "@/components/ui/PageHero";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionIntro from "@/components/ui/SectionIntro";
import Eyebrow from "@/components/ui/Eyebrow";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { Check, Briefcase, Landmark, GraduationCap, Radio } from "lucide-react";
import { squads } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

/** The spheres KIP names explicitly as the ground it means to shift. */
const spheres = [
  { icon: Briefcase, name: "Business" },
  { icon: Landmark, name: "Governance" },
  { icon: GraduationCap, name: "Education" },
  { icon: Radio, name: "Media" },
];

const mission = [
  "Engage the world's systems without losing their Kingdom identity",
  "Are strategically positioned for societal transformation",
  "Operate by divine wisdom, not worldly philosophy",
  "Discern and overcome forces that oppose Kingdom influence",
  "Function from a place of reverence for God and deep love for Him",
];

export default function KIPPageClient() {
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await squads.registerKIP({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
      });
      success("Welcome to the Kingdom Influencing Platform!");
      setRegistered(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div data-brand="expressions">
      <PageHero
        eyebrow="Kingdom Influencing Platform"
        title="We do not conform. We transform."
        subtitle="Raising Kingdom voices. Shaping systems. Advancing God's agenda."
        description="A tier of the Ecclesia Embassy committed to raising and equipping Kingdom ambassadors who carry the culture of Heaven into every sphere of society."
        backgroundImage="/site/nations-globe.jpg"
        backgroundPosition="center"
        actions={[
          { href: "#join", label: "Join the Platform", variant: "primary" },
          { href: "#about", label: "What We Are Building", variant: "secondary", onDark: true },
        ]}
      />

      {/* ── SPHERES ───────────────────────────────────────────────────
          KIP is defined by where it goes, so the spheres lead — a wide
          four-up rail that belongs to this page alone. */}
      <SectionWrapper variant="white" id="about" density="compact">
        <div className="grid gap-px overflow-hidden rounded-[26px] border border-slate/8 bg-slate/8 sm:grid-cols-2 lg:grid-cols-4">
          {spheres.map((sphere) => {
            const Icon = sphere.icon;
            return (
              <div
                key={sphere.name}
                className="flex items-center gap-4 bg-white px-6 py-7"
              >
                <div className="brand-tile h-11 w-11 shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="font-heading text-lg font-bold text-slate">{sphere.name}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center font-body text-sm italic text-gray-text">
          We engage systems not to blend in, but to shift culture.
        </p>
      </SectionWrapper>

      {/* ── VISION AND PHILOSOPHY ── */}
      <SectionWrapper variant="paper">
        <SectionIntro
          align="center"
          eyebrow="About KIP"
          title="In this world, but not of it"
          description="We exist to ensure that believers do not merely exist within the world's systems — but transform them through Kingdom principles, divine wisdom, and unwavering devotion to God."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="brand-card h-full p-7 md:p-8">
            <Eyebrow>Our vision</Eyebrow>
            <p className="mt-5 font-body text-[15px] leading-8 text-gray-text">
              To seek God by raising and equipping Kingdom ambassadors who influence every sphere of
              society — shining as lights in the world while upholding God&rsquo;s standards.
            </p>
          </div>

          <div className="brand-card h-full p-7 md:p-8">
            <Eyebrow>Our philosophy</Eyebrow>
            <p className="mt-5 font-body text-[15px] leading-8 text-gray-text">
              We are in this world — but we are not of it. We engage systems — business, governance,
              education, media — not to blend in, but to shift culture. Our identity is anchored in
              the Kingdom of God.
            </p>
            <p className="mt-5 font-heading text-lg font-bold text-slate">
              We do not conform. We transform.
            </p>
          </div>
        </div>

        {/* Mission as a numbered rail. */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Eyebrow>Our mission</Eyebrow>
            <h3 className="mt-5 font-heading text-[26px] font-bold leading-tight text-slate md:text-[32px]">
              We are intentional about raising believers who…
            </h3>
          </div>

          <ol className="divide-y divide-slate/8 border-y border-slate/8">
            {mission.map((item, index) => (
              <li key={item} className="flex items-baseline gap-5 py-5">
                <span className="font-heading text-[13px] font-bold tracking-[0.18em] text-[var(--brand-accent-text)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="font-body text-[15px] leading-7 text-[#3A3740]">{item}</p>
              </li>
            ))}
          </ol>
        </div>
      </SectionWrapper>

      {/* ── WHAT WE ARE BUILDING ── */}
      <SectionWrapper variant="brand-band" hairline width="narrow">
        <div className="text-center">
          <Eyebrow align="center">What we are building</Eyebrow>
          <p className="mt-8 font-serif text-2xl italic leading-relaxed text-white/85 md:text-3xl">
            We are not raising passive believers.
          </p>
          <p className="mx-auto mt-6 max-w-2xl font-body text-[15px] leading-8 text-white/64 md:text-base">
            We are raising{" "}
            <span className="font-semibold text-white">
              disciplined, discerning, and dangerous Kingdom operators
            </span>{" "}
            — men and women who can step into systems and shift them, establish righteousness, and
            advance God&rsquo;s agenda on the earth.
          </p>
        </div>
      </SectionWrapper>

      {/* ── JOIN ── */}
      <SectionWrapper variant="brand-ink" id="join" hairline>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
          <div>
            <Eyebrow>Join the platform</Eyebrow>
            <h2 className="mt-6 font-heading text-3xl font-bold leading-[1.1] text-white md:text-[42px]">
              Take your sphere.
            </h2>
            <p className="mt-5 max-w-lg font-body text-[15px] leading-8 text-white/66">
              Tell us where you already stand — business, governance, education, media, or anywhere
              else — and we&rsquo;ll bring you into the platform equipping people there.
            </p>
          </div>

          <div className="rounded-[30px] border border-white/12 bg-[var(--brand-ink)]/72 p-6 backdrop-blur-md md:p-8">
            {registered ? (
              <div className="rounded-[22px] border border-white/10 bg-white/8 p-8 text-center">
                <Check className="mx-auto mb-3 h-10 w-10 text-[var(--brand-accent-text)]" />
                <h3 className="font-heading text-lg font-bold text-white">Welcome aboard</h3>
                <p className="mt-2 font-body text-sm text-white/65">
                  You have been registered for the Kingdom Influencing Platform.
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-heading text-xl font-bold text-white">Sign up</h3>
                <p className="mt-2 font-body text-sm text-white/55">
                  A few details and we&rsquo;ll be in touch.
                </p>
                <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
                  <Input id="name" name="name" placeholder="Full Name" required />
                  <Input id="email" name="email" type="email" placeholder="Email Address" required />
                  <Input id="phone" name="phone" type="tel" placeholder="Phone Number" required />
                  <Input
                    id="sphere"
                    name="sphere"
                    placeholder="Sphere of Influence (e.g. Education, Media)"
                    required
                  />
                  <Button type="submit" variant="giving" className="mt-1 w-full" disabled={loading}>
                    {loading ? "Signing up..." : "Sign Up"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
