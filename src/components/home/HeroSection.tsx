'use client';

import React from 'react';
import Link from 'next/link';
import { HeroText, FadeIn, ParallaxBg, ShimmerLine } from '@/components/ui/Motion';
import Button from '@/components/ui/Button';

const HeroSection: React.FC = () => {
  const backgroundImageUrl =
    'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1920&q=80';

  return (
    <section className="relative min-h-[85vh] w-full overflow-hidden">
      {/* Background Image with Parallax and Zoom Effect */}
      <ParallaxBg
        className="absolute inset-0 w-full h-full"
      >
        <img
          src={backgroundImageUrl}
          alt="Worship gathering at The Ecclesia Embassy"
          className="w-full h-full object-cover"
        />
      </ParallaxBg>

      {/* Dark Overlay */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ backgroundColor: 'rgba(14, 0, 22, 0.84)' }}
      />

      {/* Content Container */}
      <div className="relative z-10 h-full min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Title */}
          <HeroText className="text-white">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-heading tracking-tight">
              Welcome Home
            </h1>
          </HeroText>

          {/* Subtitle */}
          <FadeIn delay={0.2}>
            <p className="text-xl sm:text-2xl font-serif italic text-gray-100">
              Word, Kingdom and Worship.
            </p>
          </FadeIn>

          {/* Decorative Shimmer Line */}
          <FadeIn delay={0.3}>
            <div className="flex justify-center py-2">
              <ShimmerLine className="w-24" />
            </div>
          </FadeIn>

          {/* CTA Buttons */}
          <FadeIn delay={0.4} className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <div
              className="animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: '0.5s' }}
            >
              <Link href="/new-here">
                <Button
                  variant="primary"
                  className="w-full sm:w-auto"
                >
                  New Here?
                </Button>
              </Link>
            </div>

            <div
              className="animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: '0.6s' }}
            >
              <Link href="/give">
                <Button
                  variant="secondary"
                  onDark
                  className="w-full sm:w-auto"
                >
                  Give / Sow
                </Button>
              </Link>
            </div>

            <div
              className="animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: '0.7s' }}
            >
              <Link href="/grow">
                <Button
                  variant="secondary"
                  onDark
                  className="w-full sm:w-auto"
                >
                  Grow with Us
                </Button>
              </Link>
            </div>

            <div
              className="animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: '0.8s' }}
            >
              <Link href="/messages">
                <Button
                  variant="secondary"
                  onDark
                  className="w-full sm:w-auto"
                >
                  Latest Message
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>

        {/* Scroll Down Indicator */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          style={{
            animation: 'bounce 2s infinite',
          }}
        >
          <svg
            className="w-6 h-6 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* CSS for enhanced bounce animation */}
      <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translate(-50%, 0);
            opacity: 0.7;
          }
          50% {
            transform: translate(-50%, -12px);
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
