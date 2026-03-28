import { cn } from "@/lib/utils";
import Link from "next/link";

interface FeatureCardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  href: string;
  className?: string;
}

export default function FeatureCard({
  title,
  subtitle,
  imageUrl,
  href,
  className,
}: FeatureCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col items-center justify-center overflow-hidden rounded-[8px] aspect-[4/3] text-center",
        "transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg",
        className
      )}
    >
      {/* Background image */}
      {imageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-purple-dark" />
      )}

      {/* Card overlay — Design System Section 2.4 */}
      <div className="absolute inset-0 bg-[rgba(20,0,19,0.76)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-2 px-6">
        <h3 className="font-heading text-[28px] font-bold text-white leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="font-serif text-lg italic text-off-white">
            {subtitle}
          </p>
        )}
        <span className="mt-3 text-nav-link text-white group-hover:underline">
          LEARN MORE
        </span>
      </div>
    </Link>
  );
}
