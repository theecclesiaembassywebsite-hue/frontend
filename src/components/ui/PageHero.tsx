import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Eyebrow from "@/components/ui/Eyebrow";
import { buttonClasses, type ButtonVariant } from "@/components/ui/button-styles";

type HeroAction = {
  href: string;
  label: string;
  variant?: ButtonVariant;
  onDark?: boolean;
  glow?: boolean;
};

type HeroStat = {
  value: string;
  label: string;
};

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  backgroundPosition?: string;
  /**
   * Looping muted footage behind the hero. `backgroundImage` is still used —
   * it becomes the poster, so the hero is never a black box while the file
   * downloads and stays correct for anyone who blocks autoplay.
   */
  backgroundVideo?: string;
  /**
   * Bright daytime photography needs a heavier wash than the default, or the
   * eyebrow and body copy sit on near-white and stop being readable.
   */
  wash?: "standard" | "deep";
  actions?: HeroAction[];
  stats?: HeroStat[];
  align?: "left" | "center";
  className?: string;
  compact?: boolean;
}

/**
 * The standard page opener used across the site. It reads its palette from
 * the surrounding `data-brand` field — `embassy` by default, set on <body> —
 * which is what lets a section page and a programme page share a silhouette
 * without sharing a colourway.
 */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  description,
  backgroundImage,
  backgroundPosition = "center",
  backgroundVideo,
  wash = "standard",
  actions,
  stats,
  align = "center",
  className,
  compact = false,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden bg-[image:var(--brand-hero)]",
        compact ? "py-16 sm:py-24 md:py-28" : "py-20 sm:py-28 md:py-36",
        className
      )}
    >
      {backgroundVideo ? (
        <video
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          style={{ objectPosition: backgroundPosition }}
          src={backgroundVideo}
          poster={backgroundImage}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : backgroundImage ? (
        // Deliberately next/image rather than a CSS background: this is the
        // largest asset on most pages, and only the optimizer will resize and
        // re-encode it per device. `priority` because it is the LCP element.
        <Image
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
          style={{ objectPosition: backgroundPosition }}
        />
      ) : null}

      {backgroundImage || backgroundVideo ? (
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 -z-10",
            wash === "deep" ? "brand-photo-wash-deep" : "brand-photo-wash"
          )}
        />
      ) : null}

      <div aria-hidden="true" className="brand-orb -left-28 top-0 h-64 w-64" />
      <div aria-hidden="true" className="brand-orb -right-20 bottom-0 h-72 w-72 opacity-70" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,_transparent_0%,_rgba(9,7,26,0.5)_100%)]"
      />

      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 md:px-8">
        <div className={cn("max-w-4xl", align === "center" && "mx-auto text-center")}>
          {eyebrow ? <Eyebrow align={align}>{eyebrow}</Eyebrow> : null}
          <h1 className="mt-6 font-heading text-[38px] font-bold leading-[1.03] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-5 font-serif text-xl italic text-white/88 md:text-2xl">
              {subtitle}
            </p>
          ) : null}
          {description ? (
            <p
              className={cn(
                "mt-6 max-w-3xl font-body text-base leading-8 text-white/68 md:text-lg",
                align === "center" && "mx-auto"
              )}
            >
              {description}
            </p>
          ) : null}

          {actions?.length ? (
            <div
              className={cn(
                "mt-10 flex flex-wrap gap-3",
                align === "center" && "justify-center"
              )}
            >
              {actions.map((action) => {
                const key = `${action.href}-${action.label}`;
                const classes = buttonClasses({
                  variant: action.variant ?? "primary",
                  onDark: action.onDark ?? true,
                });

                if (!action.glow) {
                  return (
                    <Link key={key} href={action.href} className={classes}>
                      {action.label}
                    </Link>
                  );
                }

                return (
                  <span key={key} className="relative inline-flex">
                    <span className="absolute -inset-[3px] rounded-full border border-gold/40 animate-[pulse_2.8s_ease-in-out_infinite]" />
                    <span className="absolute -inset-[7px] rounded-full border border-gold/15 animate-[pulse_2.8s_ease-in-out_infinite_0.4s]" />
                    <Link href={action.href} className={classes}>
                      {action.label}
                    </Link>
                  </span>
                );
              })}
            </div>
          ) : null}

          {stats?.length ? (
            <dl
              className={cn(
                "mt-12 grid gap-3 sm:grid-cols-3",
                align === "center" ? "mx-auto max-w-3xl" : "max-w-3xl"
              )}
            >
              {stats.map((stat) => (
                <div
                  key={`${stat.label}-${stat.value}`}
                  className="flex flex-col rounded-[26px] border border-white/12 bg-white/[0.07] px-5 py-5 backdrop-blur-md"
                >
                  <dt className="order-2 mt-1 font-body text-sm text-white/55">
                    {stat.label}
                  </dt>
                  <dd className="order-1 font-heading text-2xl font-bold text-white md:text-3xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}
