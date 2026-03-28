import Link from "next/link";
import Button from "@/components/ui/Button";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
      {/* Background image — replace src with actual hero image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/images/hero-bg.jpg')",
        }}
      />

      {/* Fallback gradient if no image */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-dark via-purple to-purple-vivid" />

      {/* Dark purple overlay — Design System Section 2.4 */}
      <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1200px] px-4 py-24 text-center sm:px-6 md:px-8">
        <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
          Welcome Home
        </h1>
        <h6 className="mt-3 font-serif text-lg font-light text-off-white md:text-xl">
          Word, Kingdom and Worship.
        </h6>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link href="/new-here">
            <Button variant="primary">New Here?</Button>
          </Link>
          <Link href="/give">
            <Button variant="secondary" onDark>
              Give / Sow
            </Button>
          </Link>
          <Link href="/grow">
            <Button variant="secondary" onDark>
              Grow with Us
            </Button>
          </Link>
          <Link href="/resources/video">
            <Button variant="secondary" onDark>
              Latest Message
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
