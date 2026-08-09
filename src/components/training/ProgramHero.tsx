"use client";

import { cn } from "@/lib/utils";
import { FadeIn, Float } from "@/components/ui/Motion";
import Eyebrow from "@/components/ui/Eyebrow";
import Image from "next/image";
import { ReactNode } from "react";

type HeroStat = {
  label: string;
  value: string;
};

interface ProgramHeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;

  logoSrc: string;
  logoAlt: string;
  logoWidth: number;
  logoHeight: number;
  logoClassName?: string;

  /** Photograph behind the whole hero, washed in the field colour. */
  backgroundImage?: string;
  backgroundPosition?: string;

  /** Photograph shown inside the identity panel, beneath the logo. */
  panelImage?: string;
  panelImageAlt?: string;

  chips?: string[];
  stats?: HeroStat[];
  actions?: ReactNode;
  aside?: ReactNode;

  /** Replaces the identity panel outright when a page wants its own. */
  panel?: ReactNode;
  className?: string;
}

/**
 * The opener shared by the programme pages — KISOLAM, EIS, the
 * Intentionality Class. Every visual decision here reads from the
 * `data-brand` field on the page root, so the three heroes are built from
 * one component yet arrive in three different worlds. Stats sit on a
 * divided rail rather than in boxes, which is what distinguishes a
 * programme hero from the boxed-stat `PageHero` used elsewhere.
 */
export default function ProgramHero({
  eyebrow,
  title,
  subtitle,
  description,
  logoSrc,
  logoAlt,
  logoWidth,
  logoHeight,
  logoClassName,
  backgroundImage,
  backgroundPosition = "center",
  panelImage,
  panelImageAlt = "",
  chips = [],
  stats = [],
  actions,
  aside,
  panel,
  className,
}: ProgramHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden bg-[image:var(--brand-hero)] py-20 text-white md:py-28",
        className
      )}
    >
      {backgroundImage ? (
        <>
          <Image
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover opacity-70"
            style={{ objectPosition: backgroundPosition }}
          />
          <div aria-hidden="true" className="brand-photo-wash absolute inset-0 -z-10" />
        </>
      ) : null}

      <div aria-hidden="true" className="brand-orb -left-32 top-4 h-72 w-72" />
      <div aria-hidden="true" className="brand-orb -right-24 bottom-0 h-80 w-80 opacity-80" />
      <div aria-hidden="true" className="brand-hairline absolute inset-x-0 top-0 h-px" />

      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 md:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.06fr_0.94fr]">
          <div>
            <FadeIn direction="up">
              <Eyebrow>{eyebrow}</Eyebrow>
            </FadeIn>

            <FadeIn direction="up" delay={0.08}>
              <h1 className="mt-6 font-heading text-[40px] font-bold leading-[1.02] tracking-tight text-white md:text-6xl lg:text-[68px]">
                {title}
              </h1>
            </FadeIn>

            <FadeIn direction="up" delay={0.16}>
              <p className="mt-5 max-w-2xl font-serif !text-xl italic text-white/85 md:!text-[26px]">
                {subtitle}
              </p>
            </FadeIn>

            <FadeIn direction="up" delay={0.24}>
              <p className="mt-6 max-w-2xl font-body text-[15px] leading-8 text-white/64 md:text-base">
                {description}
              </p>
            </FadeIn>

            {chips.length > 0 && (
              <FadeIn direction="up" delay={0.32}>
                <div className="mt-7 flex flex-wrap gap-2.5">
                  {chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/12 bg-white/6 px-4 py-2 font-body text-xs text-white/78 backdrop-blur-sm"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </FadeIn>
            )}

            {actions ? (
              <FadeIn direction="up" delay={0.4} className="mt-9 flex flex-wrap gap-3">
                {actions}
              </FadeIn>
            ) : null}
          </div>

          <Float>
            {panel ?? (
              <div className="rounded-[34px] border border-white/12 bg-white/[0.07] p-4 shadow-[0_34px_90px_rgba(0,0,0,0.45)] backdrop-blur-md md:p-6">
                <div className="relative flex min-h-[240px] items-center justify-center overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(160deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02))] p-8 md:min-h-[300px]">
                  <div
                    aria-hidden="true"
                    className="brand-orb inset-6 h-auto w-auto opacity-60"
                  />
                  <Image
                    src={logoSrc}
                    alt={logoAlt}
                    width={logoWidth}
                    height={logoHeight}
                    priority
                    className={cn(
                      "relative h-auto w-full object-contain drop-shadow-[0_22px_48px_rgba(0,0,0,0.42)]",
                      logoClassName
                    )}
                  />
                </div>

                {panelImage ? (
                  <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-[22px] border border-white/10">
                    <Image
                      src={panelImage}
                      alt={panelImageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.55)_100%)]"
                    />
                  </div>
                ) : null}

                {aside ? (
                  <div className="mt-4 rounded-[22px] border border-white/8 bg-black/25 p-5">
                    {aside}
                  </div>
                ) : null}
              </div>
            )}
          </Float>
        </div>

        {stats.length > 0 && (
          <FadeIn direction="up" delay={0.2}>
            <dl className="mt-14 grid gap-px overflow-hidden rounded-[26px] border border-white/10 bg-white/10 sm:grid-cols-3">
              {stats.map((stat) => (
                // Value above caption, matching the TEMA hero and PageHero so
                // every stat rail on the site reads the same way round. The
                // <dt> stays first in the DOM; only the visual order flips.
                <div
                  key={stat.label}
                  className="flex flex-col bg-[var(--brand-ink)]/70 px-6 py-6 backdrop-blur-sm"
                >
                  <dt className="order-2 mt-2 font-body text-[11px] uppercase tracking-[0.2em] text-white/55">
                    {stat.label}
                  </dt>
                  <dd className="order-1 font-heading text-2xl font-bold text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
