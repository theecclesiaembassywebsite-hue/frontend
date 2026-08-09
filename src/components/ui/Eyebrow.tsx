import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  as?: "p" | "span" | "div";
}

/**
 * The house eyebrow — a short rule followed by small caps, tinted with
 * whatever `--brand-accent` the surrounding `data-brand` field defines.
 * It appears above almost every section on the site, and is the single
 * strongest cue that two very different-looking pages belong together.
 */
export default function Eyebrow({
  children,
  align = "left",
  className,
  as: Tag = "p",
}: EyebrowProps) {
  return (
    <Tag
      className={cn("eyebrow", align === "center" && "eyebrow--centered", className)}
    >
      {children}
    </Tag>
  );
}
