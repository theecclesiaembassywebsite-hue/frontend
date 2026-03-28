import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type SectionVariant =
  | "dark-purple"
  | "dark-slate"
  | "charcoal"
  | "white"
  | "off-white"
  | "lavender";

interface SectionWrapperProps {
  variant?: SectionVariant;
  className?: string;
  children: ReactNode;
  id?: string;
}

const variantStyles: Record<SectionVariant, string> = {
  "dark-purple": "bg-purple-dark text-white",
  "dark-slate": "bg-slate text-white",
  charcoal: "bg-charcoal text-white",
  white: "bg-white text-slate",
  "off-white": "bg-off-white text-slate",
  lavender: "bg-lavender text-slate",
};

export default function SectionWrapper({
  variant = "white",
  className,
  children,
  id,
}: SectionWrapperProps) {
  return (
    <section id={id} className={cn("py-16 md:py-24", variantStyles[variant], className)}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-8">
        {children}
      </div>
    </section>
  );
}
