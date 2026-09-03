"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { ExternalLink, PlayCircle, Search, X, Film } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionIntro from "@/components/ui/SectionIntro";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import { StaggerContainer, StaggerItem } from "@/components/ui/Motion";
import { normalizeEmbedUrl } from "@/lib/utils";
import { fetchVideoMessages, type VideoMessage as ManualVideo } from "@/lib/videoMessages";

function formatVideoDate(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "Date unavailable"
    : format(parsed, "MMMM d, yyyy");
}

function VideoPlayer({
  video,
  onClose,
}: {
  video: ManualVideo;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const embedUrl = normalizeEmbedUrl(video.watchUrl);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[24px] border border-white/12 bg-[var(--brand-ink)] shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent-text)]">
              {video.sourceLabel}
            </p>
            <h2 className="mt-1 line-clamp-2 font-heading text-base font-bold text-white">
              {video.title}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-3 pt-0.5">
            <a
              href={video.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80 transition hover:bg-white/18"
            >
              YouTube <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={onClose}
              aria-label="Close player"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="aspect-video w-full bg-black">
          {embedUrl ? (
            <iframe
              src={`${embedUrl}&autoplay=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-body text-sm text-white/55">
              Unable to load video
            </div>
          )}
        </div>

        {video.description ? (
          <p className="px-5 py-4 font-body text-sm leading-6 text-white/60">
            {video.description}
          </p>
        ) : null}

      </div>
    </div>
  );
}

export default function VideoMessagesPageClient() {
  const [videoMessages, setVideoMessages] = useState<ManualVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVideo, setActiveVideo] = useState<ManualVideo | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const mappedVideos = await fetchVideoMessages();

        if (mappedVideos.length === 0) {
          throw new Error("No videos available");
        }

        setVideoMessages(mappedVideos);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch videos"
        );
        setVideoMessages([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchVideos();
  }, []);

  const filteredVideos = videoMessages.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div data-brand="resources">
      {activeVideo ? (
        <VideoPlayer video={activeVideo} onClose={() => setActiveVideo(null)} />
      ) : null}

      <PageHero
        eyebrow="Video Messages"
        title="Watch the Word again."
        subtitle="Teachings and messages from The Ecclesia Embassy."
        description="Every message we publish, gathered in one place and searchable by title — play it here, or open it on YouTube."
        backgroundImage="/site/teaching.jpg"
        backgroundPosition="center 25%"
        compact
      />

      <SectionWrapper variant="paper">
        <SectionIntro
          eyebrow="The archive"
          title="Browse every message"
          description="Search by title to find a teaching, then play it without leaving the page."
        />

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-text" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos by title"
              className="w-full rounded-full border border-slate/10 bg-white py-3.5 pl-11 pr-4 font-body text-sm text-slate shadow-sm outline-none transition focus:border-[var(--brand-accent)]"
            />
          </div>
          {!loading && !error ? (
            <p className="font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-gray-text">
              {filteredVideos.length} video{filteredVideos.length === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>

        <div className="mt-12">
        {loading ? (
          <SkeletonGroup count={6} variant="card" columns={3} />
        ) : error || videoMessages.length === 0 || filteredVideos.length === 0 ? (
          <div className="brand-card brand-card--static mx-auto max-w-md p-12 text-center">
            <div className="brand-tile mx-auto h-14 w-14">
              <Film className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-heading text-xl font-bold text-slate">
              {error ? "Nothing to play right now" : "No messages found"}
            </h3>
            <p className="mx-auto mt-2 max-w-xs font-body text-sm text-gray-text">
              {error
                ? `${error}. Please try again later.`
                : videoMessages.length === 0
                  ? "No videos have been published yet. Check back soon."
                  : "No videos matched your search. Try a different title."}
            </p>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video) => (
              <StaggerItem key={video.id}>
                <article className="brand-card flex h-full flex-col overflow-hidden">
                  {/* One button covers the thumbnail and title — the YouTube
                      link sits outside it, since an anchor nested inside a
                      button is invalid and swallows the click on some browsers. */}
                  <button
                    onClick={() => setActiveVideo(video)}
                    className="group block flex-1 text-left"
                  >
                    <div className="relative aspect-video overflow-hidden bg-[image:var(--brand-band)]">
                      <Image
                        src={video.thumbnail}
                        alt=""
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ opacity: 1 }}
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(11,9,24,0.78)_100%)]"
                      />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/14 text-white backdrop-blur-sm transition group-hover:border-transparent group-hover:bg-[var(--brand-accent)] group-hover:text-[var(--brand-on-accent)]">
                          <PlayCircle className="h-8 w-8" />
                        </span>
                      </span>
                    </div>

                    <div className="p-6">
                      <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand-accent-text)]">
                        {video.sourceLabel}
                      </p>
                      <h3 className="mt-3 line-clamp-2 font-heading text-lg font-bold leading-snug text-slate transition-colors group-hover:text-[var(--brand-accent-text)]">
                        {video.title}
                      </h3>
                      <p className="mt-3 font-body text-xs text-gray-text">
                        {formatVideoDate(video.publishedAt)}
                      </p>
                    </div>
                  </button>

                  <div className="border-t border-slate/8 px-6 py-3.5">
                    <a
                      href={video.watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-gray-text transition-colors hover:text-slate"
                    >
                      Watch on YouTube <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
        </div>
      </SectionWrapper>
    </div>
  );
}
