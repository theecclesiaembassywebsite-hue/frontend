"use client";

import Link from "next/link";
import { FadeIn, ShimmerLine } from "@/components/ui/Motion";
import { Heart } from "lucide-react";

const siteLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Resources", href: "/resources/audio" },
  { label: "Events", href: "/events" },
  { label: "Livestream", href: "/live" },
  { label: "Give", href: "/give" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const joinLinks = [
  { label: "New Here?", href: "/new-here" },
  { label: "Grow with Us", href: "/grow" },
  { label: "Join a Squad", href: "/kingdom/squads" },
  { label: "Find a Hub", href: "/cith" },
  { label: "Ecclesia Nation", href: "/nation" },
  { label: "Prayer Request", href: "/prayer" },
  { label: "Share Testimony", href: "/testimonies" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <FadeIn direction="up" delay={0}>
            <div>
              <h3 className="font-heading text-lg font-bold text-white mb-4">
                The Ecclesia Embassy
              </h3>
              <p className="font-serif text-sm italic text-white/70 leading-relaxed">
                Word, Kingdom and Worship.
                <br />
                Raising Word-cultured Ambassadors.
              </p>
              <div className="mt-6 flex items-center gap-1 text-white/50">
                <span className="font-body text-xs">Built with</span>
                <Heart className="h-3 w-3 text-error" fill="currentColor" />
                <span className="font-body text-xs">for the Kingdom</span>
              </div>
            </div>
          </FadeIn>

          {/* Site Links */}
          <FadeIn direction="up" delay={0.1}>
            <div>
              <h4 className="font-heading text-base font-bold text-white mb-4">
                Quick Links
              </h4>
              <ul className="flex flex-col gap-2.5">
                {siteLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-body text-sm text-white/80 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          {/* Join Us Today */}
          <FadeIn direction="up" delay={0.2}>
            <div>
              <h4 className="font-heading text-base font-bold text-white mb-4">
                Join Us Today
              </h4>
              <ul className="flex flex-col gap-2.5">
                {joinLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-body text-sm text-white/80 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>

        {/* Divider */}
        <ShimmerLine className="mt-12 mb-6 w-full max-w-xs mx-auto" />

        {/* Bottom bar */}
        <FadeIn direction="none" delay={0.3}>
          <p className="font-body text-xs text-white/50 text-center">
            &copy; {year} The Ecclesia Embassy. All rights reserved.
          </p>
        </FadeIn>
      </div>
    </footer>
  );
}
