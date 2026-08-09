import { cn } from "@/lib/utils";

interface MediaFrameProps {
  children: React.ReactNode;
  /** Aspect ratio of the inner well. Omit when the child sets its own height. */
  ratio?: "video" | "square" | "portrait" | "wide" | "auto";
  /** Caption rendered below the frame. */
  caption?: React.ReactNode;
  /** Small label pinned to the bottom-left of the frame. */
  badge?: React.ReactNode;
  /** Adds the soft field-coloured glow behind the frame. */
  glow?: boolean;
  className?: string;
  innerClassName?: string;
}

const ratioClasses: Record<NonNullable<MediaFrameProps["ratio"]>, string> = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[16/7]",
  auto: "",
};

/**
 * One frame for every piece of media on the site — adverts, photography,
 * posters. Before this, four pages each drew their own border, radius and
 * shadow around a <video>, which is what made them feel unrelated.
 */
export default function MediaFrame({
  children,
  ratio = "video",
  caption,
  badge,
  glow = false,
  className,
  innerClassName,
}: MediaFrameProps) {
  return (
    <figure className={cn("relative", className)}>
      {glow ? (
        <div
          aria-hidden="true"
          className="brand-orb -inset-6 h-auto w-auto rounded-[48px] opacity-70"
        />
      ) : null}

      <div className="relative rounded-[30px] border border-white/12 bg-white/6 p-2.5 shadow-[0_28px_70px_rgba(9,7,26,0.4)] backdrop-blur-sm sm:p-3">
        <div
          className={cn(
            "relative overflow-hidden rounded-[22px] bg-black",
            ratioClasses[ratio],
            innerClassName
          )}
        >
          {children}

          {badge ? (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/45 px-3 py-1.5 font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur-md">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--brand-accent)" }}
              />
              {badge}
            </span>
          ) : null}
        </div>
      </div>

      {caption ? (
        <figcaption className="mt-3 px-1 font-body text-xs text-white/55">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
