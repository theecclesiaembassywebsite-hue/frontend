"use client";

import { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/components/ui/reveal";

/* ============================================
   THE ECCLESIA EMBASSY — Animation System

   The public API here is unchanged, but the implementation is now CSS
   transitions driven by a single shared IntersectionObserver rather than a
   motion component per element. Same reveals, a fraction of the work.
   ============================================ */

type Direction = "up" | "down" | "left" | "right" | "none";

/** Travel offsets, applied as custom properties the CSS reads. */
function offsetVars(direction: Direction, distance: number): CSSProperties {
  switch (direction) {
    case "up":
      return { "--reveal-y": `${distance}px` } as CSSProperties;
    case "down":
      return { "--reveal-y": `${-distance}px` } as CSSProperties;
    case "left":
      return { "--reveal-x": `${distance}px` } as CSSProperties;
    case "right":
      return { "--reveal-x": `${-distance}px` } as CSSProperties;
    default:
      return {};
  }
}

// ---- Fade In (basic reveal) ----
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: Direction;
  distance?: number;
  /** Retained for API compatibility; reveals have always been one-way. */
  once?: boolean;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  className,
  direction = "up",
  distance = 30,
}: FadeInProps) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      data-reveal=""
      className={className}
      style={
        {
          ...offsetVars(direction, distance),
          "--reveal-delay": `${delay * 1000}ms`,
          "--reveal-duration": `${duration * 1000}ms`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

// ---- Stagger Children ----
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  /** Kept for API compatibility; the cascade is defined in CSS. */
  staggerDelay?: number;
  once?: boolean;
}

export function StaggerContainer({ children, className }: StaggerContainerProps) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} data-stagger="" className={className}>
      {children}
    </div>
  );
}

// ---- Stagger Item (use inside StaggerContainer) ----
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}

export function StaggerItem({ children, className, direction = "up" }: StaggerItemProps) {
  return (
    <div
      data-stagger-item=""
      className={className}
      style={offsetVars(direction, 24)}
    >
      {children}
    </div>
  );
}

// ---- Scale In (for cards, icons) ----
interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
}

export function ScaleIn({ children, delay = 0, className }: ScaleInProps) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      data-reveal=""
      className={cn("origin-center", className)}
      style={
        {
          "--reveal-scale": "0.85",
          "--reveal-delay": `${delay * 1000}ms`,
          "--reveal-duration": "700ms",
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

// ---- Animated Counter ----
interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  className,
}: AnimatedCounterProps) {
  const ref = useReveal<HTMLSpanElement>();

  return (
    <span ref={ref} data-reveal="" className={className}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

// ---- Page Transition Wrapper ----
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return <div className={cn("animate-[fadeIn_400ms_ease-out]", className)}>{children}</div>;
}

// ---- Hero Text Animation ----
interface HeroTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function HeroText({ children, className, delay = 0 }: HeroTextProps) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      data-reveal=""
      className={className}
      style={
        {
          "--reveal-y": "40px",
          "--reveal-delay": `${delay * 1000}ms`,
          "--reveal-duration": "800ms",
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

// ---- Parallax Background (subtle) ----
interface ParallaxBgProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export function ParallaxBg({ children, className }: ParallaxBgProps) {
  return <div className={className}>{children}</div>;
}

// ---- Hover Lift (for interactive cards) ----
interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  lift?: number;
}

export function HoverLift({ children, className }: HoverLiftProps) {
  return <div className={cn("brand-hover-lift", className)}>{children}</div>;
}

// ---- Shimmer / Glow Line ----
export function ShimmerLine({ className }: { className?: string }) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      data-reveal=""
      className={cn(
        "h-[2px] origin-left bg-gradient-to-r from-transparent via-purple-vivid to-transparent",
        className
      )}
      style={{ "--reveal-duration": "800ms", "--reveal-delay": "300ms" } as CSSProperties}
    />
  );
}

// ---- Floating element (subtle bob animation) ----
export function Float({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("brand-float", className)}>{children}</div>;
}
