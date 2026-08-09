"use client";

import PageHero from "@/components/ui/PageHero";

export default function HeroSection() {
  return (
    <PageHero
      eyebrow="Welcome Home"
      title="A House for Worship, the Word, and Kingdom Life."
      subtitle="Word, Kingdom and Worship."
      description="Join a praying, Word-cultured global movement where believers are discipled deeply, communities are formed intentionally, and every gathering points us back to Christ."
      // The same opening footage the main Ecclesia Embassy site leads with.
      // The poster is a frame lifted from it, so the hero looks identical
      // before the video arrives or where autoplay is refused.
      backgroundVideo="/home-hero-video.mp4"
      backgroundImage="/site/home-hero-poster.jpg"
      actions={[
        { href: "/new-here", label: "Plan Your Visit", variant: "primary" },
        { href: "/live", label: "Watch Live", variant: "secondary", onDark: true },
        { href: "/prayer", label: "Submit Prayer Burden", variant: "secondary", onDark: true },
      ]}
      className="min-h-[88vh]"
    />
  );
}
