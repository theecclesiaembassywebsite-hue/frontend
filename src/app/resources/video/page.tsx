"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ExternalLink, PlayCircle, Search } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { media } from "@/lib/api";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/Motion";

const CHANNELS = [
  {
    label: "The Ecclesia Embassy",
    url: "https://www.youtube.com/@TheEcclesiaEmbassy/videos",
  },
  {
    label: "Victor Oluwadamilare",
    url: "https://www.youtube.com/@VictorOluwadamilarelive/videos",
  },
];

interface ChannelVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  watchUrl: string;
}

interface PublicVideo extends ChannelVideo {
  description?: string;
  sourceLabel: string;
}

function extractYoutubeId(url?: string) {
  if (!url) return "";

  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/|youtube\.com\/live\/)([^&\n?#/]+)/
  );

  return match?.[1] ?? "";
}

function mergePublicVideos(
  youtubeUploads: ChannelVideo[],
  manualEntries: Array<Record<string, unknown>>
) {
  const mergedVideos = new Map<string, PublicVideo>();

  youtubeUploads.forEach((video) => {
    mergedVideos.set(video.id, {
      ...video,
      sourceLabel: "YouTube Upload",
    });
  });

  manualEntries.forEach((entry) => {
    const youtubeUrl =
      typeof entry.youtubeUrl === "string" ? entry.youtubeUrl : "";
    const videoId = extractYoutubeId(youtubeUrl);
    const title =
      typeof entry.title === "string" && entry.title.trim()
        ? entry.title
        : "Video Message";

    if (!videoId) {
      return;
    }

    const existing = mergedVideos.get(videoId);
    const speaker =
      typeof entry.speaker === "string" && entry.speaker.trim()
        ? entry.speaker
        : "Manual Video Entry";
    const description =
      typeof entry.description === "string" ? entry.description : "";
    const publishedAt =
      typeof entry.createdAt === "string"
        ? entry.createdAt
        : typeof entry.date === "string"
          ? entry.date
          : existing?.publishedAt ?? "";

    mergedVideos.set(videoId, {
      id: typeof entry.id === "string" ? entry.id : videoId,
      title,
      publishedAt,
      thumbnail:
        existing?.thumbnail ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      description: description || existing?.description,
      sourceLabel: existing ? `${speaker} + YouTube Upload` : speaker,
    });
  });

  return Array.from(mergedVideos.values()).sort(
    (a, b) =>
      new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
  );
}

function formatVideoDate(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "Date unavailable"
    : format(parsed, "MMMM d, yyyy");
}

export default function VideoMessagesPage() {
  const [videoMessages, setVideoMessages] = useState<PublicVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const [youtubeResult, manualResult] = await Promise.allSettled([
          fetch("/api/youtube-channel-videos"),
          media.getVideoMessages(),
        ]);

        const youtubeVideos =
          youtubeResult.status === "fulfilled"
            ? ((await youtubeResult.value.json()) as { videos?: ChannelVideo[] }).videos ?? []
            : [];
        const manualEntries =
          manualResult.status === "fulfilled"
            ? ((manualResult.value ?? []) as Array<Record<string, unknown>>)
            : [];
        const mergedVideos = mergePublicVideos(youtubeVideos, manualEntries);

        if (mergedVideos.length === 0) {
          throw new Error("No videos available from YouTube or manual entries");
        }

        setVideoMessages(mergedVideos);
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
              Watch channel uploads and curated manual video entries from The Ecclesia Embassy, including edited reuploads prepared from live services.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {CHANNELS.map((channel) => (
                <a
                  key={channel.url}
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 font-heading text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/16"
                >
                  {channel.label}
                  <ExternalLink className="h-4 w-4" />
                </a>
              ))}
            </div>
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
                <article
                  className="overflow-hidden rounded-[24px] border border-[rgba(14,11,30,0.08)] bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1"
                >
                  <a
                    href={video.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
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
                      <h2 className="mt-3 line-clamp-2 font-heading text-xl font-bold text-slate">
                        {video.title}
                      </h2>
                      <p className="mt-3 font-body text-sm text-gray-text">
                        {formatVideoDate(video.publishedAt)}
                      </p>
                      {video.description ? (
                        <p className="mt-3 line-clamp-3 font-body text-sm leading-6 text-gray-text">
                          {video.description}
                        </p>
                      ) : null}
                    </div>
                  </a>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </SectionWrapper>
    </div>
  );
}
