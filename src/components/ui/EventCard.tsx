import { cn } from "@/lib/utils";
import Link from "next/link";
import { MapPin, Clock, ArrowRight } from "lucide-react";

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

/**
 * A gathering, on the shelf. The date sits as a torn-ticket block over the
 * image so a scan down the grid reads as dates first — which is what someone
 * browsing events is actually looking for.
 */
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
    <Link href={href} className={cn("group block h-full", className)}>
      <article className="brand-card flex h-full flex-col overflow-hidden">
        <div className="relative h-44 w-full overflow-hidden bg-[image:var(--brand-band)]">
          {imageUrl && (
            /* Event artwork is admin-supplied from arbitrary hosts. */
            <img loading="lazy" decoding="async"
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(11,9,20,0.72)_100%)]"
          />

          <div className="absolute left-4 top-4 flex h-14 w-14 flex-col items-center justify-center rounded-[14px] bg-[var(--brand-accent)] text-[var(--brand-on-accent)] shadow-lg">
            <span className="font-heading text-lg font-bold leading-none">{day}</span>
            <span className="mt-0.5 font-heading text-[10px] font-bold uppercase tracking-[0.1em]">
              {month}
            </span>
          </div>

          {requiresRegistration && (
            <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/45 px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md">
              Registration
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-heading text-lg font-bold leading-snug text-slate transition-colors group-hover:text-[var(--brand-accent-text)]">
            {title}
          </h3>
          <p className="mt-2.5 line-clamp-2 font-body text-sm leading-6 text-gray-text">
            {description}
          </p>

          <dl className="mt-5 space-y-2">
            <div className="flex items-center gap-2.5">
              <Clock className="h-[14px] w-[14px] shrink-0 text-[var(--brand-accent-text)]" />
              <dd className="font-body text-[13px] text-[#3A3740]">
                {date}
                {time ? ` · ${time}` : ""}
              </dd>
            </div>
            {location && (
              <div className="flex items-center gap-2.5">
                <MapPin className="h-[14px] w-[14px] shrink-0 text-[var(--brand-accent-text)]" />
                <dd className="truncate font-body text-[13px] text-[#3A3740]">{location}</dd>
              </div>
            )}
          </dl>

          <div className="mt-auto flex items-center justify-between border-t border-slate/8 pt-4">
            <span className="font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent-text)]">
              {requiresRegistration ? "Register Now" : "View Details"}
            </span>
            <ArrowRight className="h-4 w-4 text-[var(--brand-accent-text)] transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </article>
    </Link>
  );
}
