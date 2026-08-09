import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface FeatureTileProps {
  icon?: LucideIcon;
  /** Shown in the plate instead of an icon — for numbered / lettered sequences. */
  marker?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
  children?: React.ReactNode;
}

/**
 * The card that carries an idea: icon plate, title, a line of prose.
 * Radius, shadow, hover lift and plate gradient all come from the brand
 * field, so the same component reads as bespoke on each page.
 */
export default function FeatureTile({
  icon: Icon,
  marker,
  title,
  description,
  tone = "light",
  className,
  children,
}: FeatureTileProps) {
  return (
    <div
      className={cn(
        "h-full p-6 md:p-7",
        tone === "dark" ? "brand-card-dark" : "brand-card",
        className
      )}
    >
      {Icon || marker ? (
        <div className="brand-tile h-12 w-12">
          {Icon ? (
            <Icon className="h-5 w-5" />
          ) : (
            <span className="font-heading text-sm font-bold">{marker}</span>
          )}
        </div>
      ) : null}
      <h3
        className={cn(
          "font-heading text-lg font-bold leading-snug",
          Icon || marker ? "mt-5" : "",
          tone === "dark" ? "text-white" : "text-slate"
        )}
      >
        {title}
      </h3>
      {description ? (
        <p
          className={cn(
            "mt-3 font-body text-sm leading-7",
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
