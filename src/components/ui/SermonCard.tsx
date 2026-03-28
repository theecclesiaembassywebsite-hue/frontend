import { cn } from "@/lib/utils";
import Link from "next/link";
import { Play } from "lucide-react";

interface SermonCardProps {
  title: string;
  speaker: string;
  date: string;
  thumbnailUrl?: string;
  href: string;
  className?: string;
}

export default function SermonCard({
  title,
  speaker,
  date,
  thumbnailUrl,
  href,
  className,
}: SermonCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[4px] border border-gray-border bg-white",
        "transition-shadow duration-200 hover:shadow-md",
        className
      )}
    >
      {/* Thumbnail 16:9 */}
      <div className="relative aspect-video bg-off-white">
        {thumbnailUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${thumbnailUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-purple-dark">
            <Play className="h-10 w-10 text-white/70" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 p-4">
        <h3 className="font-heading text-lg font-semibold text-slate line-clamp-2">
          {title}
        </h3>
        <p className="text-body-small">
          Speaker: {speaker} &bull; {date}
        </p>
      </div>
    </Link>
  );
}
