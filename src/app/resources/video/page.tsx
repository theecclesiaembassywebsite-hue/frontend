"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { ExternalLink, PlayCircle, Search, X } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/Motion";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative w-full max-w-4xl rounded-[20px] overflow-hidden bg-[#0E0B1E] shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.22em] text-purple-vivid">
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
            <div className="flex h-full items-center justify-center font-body text-sm text-white/50">
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

export default function VideoMessagesPage() {
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
    <div>
      {activeVideo ? (
        <VideoPlayer video={activeVideo} onClose={() => setActiveVideo(null)} />
      ) : null}

      <section
        className="relative flex h-96 items-center justify-center overflow-hidden text-center text-white"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1920&q=80)",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-4">
          <FadeIn>
            <h1 className="mb-4 font-heading text-5xl font-bold md:text-6xl">
              Video Messages
            </h1>
            <p className="mx-auto max-w-2xl font-body text-lg text-gray-200 md:text-xl">
              Browse video messages and teachings from The Ecclesia Embassy
            </p>
          </FadeIn>
        </div>
      </section>

      <SectionWrapper variant="white" className="py-12">
        <div className="mx-auto mb-8 max-w-3xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-text" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos by title"
              className="w-full rounded-full border border-gray-border bg-white py-3 pl-11 pr-4 font-body text-sm text-slate shadow-sm outline-none transition focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15"
            />
          </div>
          {!loading && !error ? (
            <p className="mt-3 text-sm font-body text-gray-text">
              {filteredVideos.length} video{filteredVideos.length === 1 ? "" : "s"} found
            </p>
          ) : null}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <SkeletonGroup count={6} variant="card" />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="font-body text-base text-gray-text">{error}</p>
          </div>
        ) : videoMessages.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-body text-base text-gray-text">
              No videos available yet.
            </p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-body text-base text-gray-text">
              No videos matched your search.
            </p>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video) => (
              <StaggerItem key={video.id}>
                <article className="overflow-hidden rounded-[24px] border border-[rgba(14,11,30,0.08)] bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1">
                  <button
                    onClick={() => setActiveVideo(video)}
                    className="group block w-full text-left"
                  >
                    <div className="relative aspect-video overflow-hidden bg-lavender">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ opacity: 1 }}
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate/80 via-slate/15 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/14 text-white shadow-[0_18px_40px_rgba(14,11,30,0.28)] backdrop-blur-sm transition group-hover:bg-red-600/92">
                          <PlayCircle className="h-9 w-9" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.24em] text-purple-vivid">
                        {video.sourceLabel}
                      </p>
                      <a
                        href={video.watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="mt-3 block line-clamp-2 font-heading text-xl font-bold text-slate transition-colors hover:text-purple-vivid"
                      >
                        {video.title}
                      </a>
                      <p className="mt-3 font-body text-sm text-gray-text">
                        {formatVideoDate(video.publishedAt)}
                      </p>
                    </div>
                  </button>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </SectionWrapper>
    </div>
  );
}
