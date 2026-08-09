import { cn } from "@/lib/utils";
import Image from "next/image";
import { ReactNode } from "react";

type SectionVariant =
  | "dark-purple"
  | "dark-slate"
  | "charcoal"
  | "white"
  | "off-white"
  | "lavender"
  /** Dark band tinted by the surrounding `data-brand` field. */
  | "brand-band"
  /** The deepest surface of the current brand field. */
  | "brand-ink"
  /** Warm paper tone that pairs with any field. */
  | "paper";

interface SectionWrapperProps {
  variant?: SectionVariant;
  className?: string;
  children: ReactNode;
  id?: string;
  /** Photograph laid behind the section, washed in the field colour. */
  backgroundImage?: string;
  /** Position for `backgroundImage`. Defaults to centre. */
  backgroundPosition?: string;
  /** Draws the field-tinted hairline across the top edge. */
  hairline?: boolean;
  /** Tightens vertical padding for short interstitial bands. */
  density?: "default" | "compact" | "roomy";
  /** Widen or narrow the content column. */
  width?: "default" | "wide" | "narrow";
}

const variantStyles: Record<SectionVariant, string> = {
  "dark-purple":
    "bg-[radial-gradient(circle_at_top,_rgba(201,168,76,0.18),_transparent_42%),linear-gradient(180deg,_#161129_0%,_#0E0B1E_100%)] text-white",
  "dark-slate":
    "bg-[radial-gradient(circle_at_top_right,_rgba(201,168,76,0.12),_transparent_35%),linear-gradient(180deg,_#151124_0%,_#0E0B1E_100%)] text-white",
  charcoal:
    "bg-[radial-gradient(circle_at_top_left,_rgba(201,168,76,0.08),_transparent_34%),linear-gradient(180deg,_#120F20_0%,_#09071A_100%)] text-white",
  // `surface-light` re-tints the gold used for small text so it clears AA
  // against these pale backgrounds. See .surface-light in globals.css.
  white:
    "surface-light bg-[linear-gradient(180deg,_rgba(255,255,255,1)_0%,_rgba(250,250,248,0.96)_100%)] text-slate",
  "off-white":
    "surface-light bg-[linear-gradient(180deg,_rgba(250,250,248,1)_0%,_rgba(245,241,232,0.72)_100%)] text-slate",
  lavender:
    "surface-light bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.88),_transparent_45%),linear-gradient(180deg,_#F5F0E6_0%,_#E8E6F0_100%)] text-slate",
  "brand-band": "bg-[image:var(--brand-band)] text-white",
  "brand-ink": "bg-[var(--brand-ink)] text-white",
  paper:
    "surface-light bg-[linear-gradient(180deg,_#FFFDF8_0%,_#F5F1E8_100%)] text-slate",
};

const densityStyles: Record<NonNullable<SectionWrapperProps["density"]>, string> = {
  compact: "py-12 md:py-16",
  default: "py-18 md:py-24",
  roomy: "py-20 md:py-32",
};

const widthStyles: Record<NonNullable<SectionWrapperProps["width"]>, string> = {
  narrow: "max-w-[960px]",
  default: "max-w-[1240px]",
  wide: "max-w-[1400px]",
};

export default function SectionWrapper({
  variant = "white",
  className,
  children,
  id,
  backgroundImage,
  backgroundPosition = "center",
  hairline = false,
  density = "default",
  width = "default",
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative isolate overflow-hidden",
        densityStyles[density],
        variantStyles[variant],
        className
      )}
    >
      {backgroundImage ? (
        <>
          {/* No `priority` here — section backgrounds sit below the fold, so
              next/image lazy-loads them as the reader arrives. */}
          <Image
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="-z-20 object-cover"
            style={{ objectPosition: backgroundPosition }}
          />
          <div aria-hidden="true" className="brand-photo-wash-deep absolute inset-0 -z-10" />
        </>
      ) : null}

      {hairline ? (
        <div aria-hidden="true" className="brand-hairline absolute inset-x-0 top-0 h-px" />
      ) : null}

      <div className={cn("relative mx-auto px-4 sm:px-6 md:px-8", widthStyles[width])}>
        {children}
      </div>
    </section>
  );
}
