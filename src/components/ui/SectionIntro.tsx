import { cn } from "@/lib/utils";
import Eyebrow from "@/components/ui/Eyebrow";

interface SectionIntroProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
  titleClassName?: string;
  children?: React.ReactNode;
}

/**
 * One section opener, used everywhere, so vertical rhythm and type scale
 * stay identical from page to page. Pages differentiate themselves through
 * layout and field colour — not by re-inventing this block.
 */
export default function SectionIntro({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  className,
  titleClassName,
  children,
}: SectionIntroProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow ? <Eyebrow align={align}>{eyebrow}</Eyebrow> : null}
      <h2
        className={cn(
          "font-heading text-3xl font-bold leading-[1.12] tracking-tight md:text-[42px]",
          eyebrow ? "mt-5" : "",
          tone === "dark" ? "text-white" : "text-slate",
          titleClassName
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-5 font-body text-[15px] leading-8 md:text-base",
            align === "center" && "mx-auto",
            tone === "dark" ? "text-white/68" : "text-gray-text"
          )}
        >
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}
