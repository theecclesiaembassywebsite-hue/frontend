import SectionIntro from "@/components/ui/SectionIntro";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
  titleClassName?: string;
}

/**
 * Kept as the site-wide alias for {@link SectionIntro} so the many pages
 * already importing it inherit the shared eyebrow rule and type scale
 * without each needing to be rewritten.
 */
export default function SectionHeading(props: SectionHeadingProps) {
  return <SectionIntro {...props} />;
}
