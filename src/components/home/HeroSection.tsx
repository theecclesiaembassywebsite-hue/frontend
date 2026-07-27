"use client";

import PageHero from "@/components/ui/PageHero";

export default function HeroSection() {
  return (
    <PageHero
      eyebrow="Welcome Home"
      title="A House for Worship, the Word, and Kingdom formation."
      subtitle="Word, Kingdom and Worship."
      description="Join a praying, Word-cultured global movement where believers are discipled deeply, communities are formed intentionally, and every gathering points us back to Christ."
      backgroundImage="https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1920&q=80"
      actions={[
        { href: "/new-here", label: "Plan Your Visit", variant: "primary" },
        { href: "/live", label: "Watch Live", variant: "secondary", onDark: true },
        { href: "/prayer", label: "Submit Prayer Burden", variant: "secondary", onDark: true },
      ]}
      className="min-h-[88vh]"
    />
  );
}
