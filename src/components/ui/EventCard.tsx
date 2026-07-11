import { cn } from "@/lib/utils";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

interface EventCardProps {
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  day: string;
  month: string;
  href: string;
  imageUrl?: string;
  requiresRegistration?: boolean;
  className?: string;
}

export default function EventCard({
  title,
  description,
  date,
  time,
  location,
  day,
  month,
  href,
  imageUrl,
  requiresRegistration,
  className,
}: EventCardProps) {
  return (
    <Link href={href} className={cn("block group", className)}>
      <div
        className={cn(
          "flex flex-col rounded-[4px] border-l-4 border-l-purple bg-white shadow-sm overflow-hidden",
          "transition-shadow duration-200 group-hover:shadow-md"
        )}
      >
        {/* Event image */}
        {imageUrl && (
          <div className="h-44 w-full overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex gap-4 p-4">
          {/* Date badge */}
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-[8px] bg-purple text-white">
            <span className="font-heading text-lg font-bold leading-tight">
              {day}
            </span>
            <span className="font-heading text-[10px] font-semibold uppercase">
              {month}
            </span>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-1 min-w-0">
            <h3 className="font-heading text-base sm:text-lg font-semibold text-slate truncate">
              {title}
            </h3>
            <p className="font-body text-sm text-gray-text line-clamp-2">
              {description}
            </p>
            <div className="mt-1 space-y-1">
              <p className="text-body-small">{date}{time ? ` · ${time}` : ""}</p>
              {location && (
                <p className="flex items-center gap-1 text-body-small">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">{location}</span>
                </p>
              )}
            </div>
            {requiresRegistration && (
              <span className="mt-2 self-start rounded-full bg-purple/10 px-3 py-1 text-xs font-semibold text-purple">
                Registration Required
              </span>
            )}
            <span className="mt-2 inline-flex items-center gap-1 font-heading text-sm font-semibold text-purple-vivid transition-transform group-hover:translate-x-1">
              {requiresRegistration ? "Register Now" : "View Details"}
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
