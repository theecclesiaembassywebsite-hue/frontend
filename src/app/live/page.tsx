"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { io } from "socket.io-client";
import { ExternalLink, Flame, Heart, Radio, Share2, X } from "lucide-react";
import { engagement, livestream, serviceSchedule } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/Skeleton";

const CHANNEL_ID = "UCrvZyTocoH926b_wv81bpzA";
const CHANNEL_URL = `https://www.youtube.com/channel/${CHANNEL_ID}`;

interface LivestreamConfig {
  isLive?: boolean;
  embedUrl?: string;
  nextService?: string;
}

interface ServiceScheduleEntry {
  id?: string;
  day: string;
  dayLabel?: string;
  name: string;
  time: string;
}

interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
}

interface YouTubeLiveStatus {
  isLive: boolean;
  videoId: string | null;
  embedUrl: string | null;
}

interface UpcomingService {
  name: string;
  startsAt: Date;
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

function normalizeWeekday(day: string) {
  const trimmedDay = day.trim().replace(/s$/i, "");
  const normalizedDay =
    trimmedDay.charAt(0).toUpperCase() + trimmedDay.slice(1).toLowerCase();

  return WEEKDAY_INDEX[normalizedDay] === undefined ? null : normalizedDay;
}

function buildYouTubeEmbedUrl(videoId: string) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
}

// Maps known channel handles to their IDs so channel-level live URLs can be embedded.
const HANDLE_TO_CHANNEL_ID: Record<string, string> = {
  theecclesiaembassy: CHANNEL_ID,
  victoroluwadamilarelive: "UCO9vOTvZ6gX3fKZoQF_CHRg",
};

function channelLiveEmbedUrl(channelId: string) {
  return `https://www.youtube.com/embed/live_stream?channel=${channelId}`;
}

function toEmbedUrl(url?: string | null) {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;

  // youtube.com/channel/CHANNEL_ID/live
  const channelIdMatch = url.match(/youtube\.com\/channel\/([^/?#]+)\/live/);
  if (channelIdMatch?.[1]) return channelLiveEmbedUrl(channelIdMatch[1]);

  // youtube.com/@handle/live
  const handleMatch = url.match(/youtube\.com\/@([^/?#]+)\/live/i);
  if (handleMatch?.[1]) {
    const id = HANDLE_TO_CHANNEL_ID[handleMatch[1].toLowerCase()];
    if (id) return channelLiveEmbedUrl(id);
  }

  // youtube.com/watch?v=, youtu.be/, /shorts/
  const videoMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/
  );
  if (videoMatch?.[1]) return buildYouTubeEmbedUrl(videoMatch[1]);

  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return buildYouTubeEmbedUrl(url);

  return url;
}

function parseServiceTime(time: string) {
  const match = time.trim().match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  const meridiem = match[3].toUpperCase();

  if (hours === 12) {
    hours = 0;
  }

  if (meridiem === "PM") {
    hours += 12;
  }

  return { hours, minutes };
}

function getRecurringServiceCandidates(
  services: ServiceScheduleEntry[],
  now: Date
) {
  return services
    .map((service) => {
      const normalizedDay = normalizeWeekday(service.day);
      const dayIndex =
        normalizedDay === null ? undefined : WEEKDAY_INDEX[normalizedDay];
      const parsedTime = parseServiceTime(service.time);

      if (dayIndex === undefined || !parsedTime) {
        return null;
      }

      const candidate = new Date(now);
      candidate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);

      let daysUntilService = (dayIndex - now.getDay() + 7) % 7;

      if (daysUntilService === 0 && candidate <= now) {
        daysUntilService = 7;
      }

      candidate.setDate(now.getDate() + daysUntilService);

      return {
        name: service.name,
        startsAt: candidate,
      } satisfies UpcomingService;
    })
    .filter((service): service is UpcomingService => service !== null);
}

function getNextUpcomingService(
  config: LivestreamConfig | null,
  services: ServiceScheduleEntry[],
  now: Date
) {
  const candidates = getRecurringServiceCandidates(services, now);

  if (config?.nextService) {
    const configuredDate = new Date(config.nextService);

    if (!Number.isNaN(configuredDate.getTime()) && configuredDate > now) {
      candidates.push({
        name: "Upcoming Service",
        startsAt: configuredDate,
      });
    }
  }

  return candidates.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0] ?? null;
}

function getCountdownParts(target: Date | null, now: Date) {
  if (!target) {
    return null;
  }

  const difference = Math.max(target.getTime() - now.getTime(), 0);

  const days = Math.floor(difference / 86_400_000);
  const hours = Math.floor((difference % 86_400_000) / 3_600_000);
  const minutes = Math.floor((difference % 3_600_000) / 60_000);
  const seconds = Math.floor((difference % 60_000) / 1_000);

  return { days, hours, minutes, seconds };
}

function StreamPlayer({
  video,
  onClose,
}: {
  video: YouTubeVideo;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const embedUrl = buildYouTubeEmbedUrl(video.id);

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
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[20px] bg-[#0E0B1E] shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              Previous Stream
            </p>
            <h2 className="mt-1 line-clamp-2 font-heading text-base font-bold text-white">
              {video.title}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-3 pt-0.5">
            <a
              href={`https://www.youtube.com/watch?v=${video.id}`}
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
          <iframe
            src={embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
          />
        </div>

        <p className="px-5 py-3 font-body text-xs text-white/55">
          {video.publishedAt ? format(new Date(video.publishedAt), "MMMM d, yyyy") : ""}
        </p>
      </div>
    </div>
  );
}

function LiveHeroSkeleton() {
  return (
    <section className="bg-slate pt-16 pb-0">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8">
        <Skeleton className="aspect-video w-full rounded-t-[20px] border-x-2 border-t-2 border-gold/20 bg-white/8" />
      </div>
    </section>
  );
}

export default function LivePage() {
  const { isAuthenticated } = useAuth();
  const [config, setConfig] = useState<LivestreamConfig | null>(null);
  const [services, setServices] = useState<ServiceScheduleEntry[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [youtubeIsLive, setYoutubeIsLive] = useState(false);
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeStream, setActiveStream] = useState<YouTubeVideo | null>(null);
  const [watchStreak, setWatchStreak] = useState<number | null>(null);
  const watchRecorded = useRef(false);

  useEffect(() => {
    document.title = "Live | The Ecclesia Embassy";

    let isMounted = true;

    const fetchConfig = async () => {
      try {
        const data = await livestream.getConfig();
        if (!isMounted) return;
        setConfig(data ?? {});
      } catch {
        if (!isMounted) return;
        setConfig({});
      } finally {
        if (isMounted) {
          setIsLoadingConfig(false);
        }
      }
    };

    const fetchServices = async () => {
      try {
        const data = await serviceSchedule.getPublic();
        if (!isMounted) return;
        setServices(data ?? []);
      } catch {
        if (!isMounted) return;
        setServices([]);
      } finally {
        if (isMounted) {
          setIsLoadingServices(false);
        }
      }
    };

    const fetchVideos = async () => {
      try {
        if (!isMounted) return;

        const res = await fetch("/api/youtube-videos");
        const data: { videos?: YouTubeVideo[] } = await res.json();
        if (!isMounted) return;
        setVideos(data.videos ?? []);
      } catch {
        if (!isMounted) return;
        setVideos([]);
      } finally {
        if (isMounted) {
          setIsLoadingVideos(false);
        }
      }
    };

    const fetchYoutubeLive = async () => {
      try {
        const res = await fetch("/api/youtube-live");
        const data: YouTubeLiveStatus = await res.json();
        if (!isMounted) return;
        setYoutubeIsLive(data.isLive ?? false);
        setYoutubeEmbedUrl(data.embedUrl ?? "");
      } catch {
        if (!isMounted) return;
        setYoutubeIsLive(false);
        setYoutubeEmbedUrl("");
      }
    };

    fetchConfig();
    fetchServices();
    fetchVideos();
    fetchYoutubeLive();

    // Live push for livestream status — falls back to the 2min safety poll
    // below if the socket never connects or drops (e.g. blocked by a proxy).
    const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api").replace(/\/api\/?$/, "");
    const socket = io(`${apiOrigin}/realtime`, { transports: ["websocket"] });
    socket.on("livestream:update", (data: LivestreamConfig) => {
      if (!isMounted) return;
      setConfig(data ?? {});
    });

    // Safety-net poll in case the socket silently drops
    const configIntervalId = window.setInterval(fetchConfig, 120000);
    const youtubeLiveIntervalId = window.setInterval(fetchYoutubeLive, 60000);
    const clockIntervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      isMounted = false;
      socket.disconnect();
      window.clearInterval(configIntervalId);
      window.clearInterval(youtubeLiveIntervalId);
      window.clearInterval(clockIntervalId);
    };
  }, []);

  // Record watch + refresh streak once per session when the stream is active
  useEffect(() => {
    if (!isAuthenticated || watchRecorded.current) return;
    const streamActive =
      (youtubeIsLive && Boolean(youtubeEmbedUrl)) ||
      Boolean(config?.isLive && config?.embedUrl);
    if (!streamActive) return;
    watchRecorded.current = true;
    engagement
      .recordWatch()
      .then(() => engagement.getStreak())
      .then((data) => setWatchStreak(data?.currentStreak ?? null))
      .catch(() => {});
  }, [youtubeIsLive, youtubeEmbedUrl, config, isAuthenticated]);

  // Fetch existing streak on mount for authenticated users (no watch recorded yet)
  useEffect(() => {
    if (!isAuthenticated) return;
    engagement
      .getStreak()
      .then((data) => setWatchStreak(data?.currentStreak ?? null))
      .catch(() => {});
  }, [isAuthenticated]);

  const manualEmbedUrl = toEmbedUrl(config?.embedUrl);
  const autoDetectedLive = youtubeIsLive && Boolean(youtubeEmbedUrl);
  const hasManualOverride = Boolean(config?.isLive && manualEmbedUrl && !autoDetectedLive);
  const iframeSrc = autoDetectedLive
    ? youtubeEmbedUrl
    : hasManualOverride
      ? manualEmbedUrl
      : "";
  const archivedVideos = videos;

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const nextUpcomingService = getNextUpcomingService(config, services, now);
  const countdown = getCountdownParts(nextUpcomingService?.startsAt ?? null, now);
  const isLoadingHero = isLoadingConfig || isLoadingServices;

  return (
    <div className="w-full">
      {activeStream ? (
        <StreamPlayer video={activeStream} onClose={() => setActiveStream(null)} />
      ) : null}

      {/* Stream hero */}
      {isLoadingHero ? (
        <LiveHeroSkeleton />
      ) : (
        <section className="relative bg-slate pt-16 pb-0">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8">
            <div className="relative aspect-video overflow-hidden rounded-t-[20px] border-x-2 border-t-2 border-gold/25 bg-black shadow-[0_30px_80px_rgba(9,7,26,0.5)]">
              {iframeSrc && (
                <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 font-heading text-[11px] font-bold uppercase tracking-[0.28em] text-white">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  Live
                </div>
              )}

              {iframeSrc ? (
                <iframe
                  src={iframeSrc}
                  title="The Ecclesia Embassy livestream"
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(201,168,76,0.22),_transparent_45%),linear-gradient(180deg,_#161129_0%,_#0E0B1E_100%)] px-6 text-center text-white">
                  <p className="mb-5 rounded-full border border-gold/35 bg-white/5 px-5 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
                    Next Service Countdown
                  </p>
                  <h2 className="font-heading text-3xl font-bold text-gold md:text-4xl">
                    {nextUpcomingService?.name ?? "We are offline"}
                  </h2>
                  <p className="mt-3 max-w-xl font-body text-sm text-white/68 md:text-base">
                    {nextUpcomingService
                      ? format(nextUpcomingService.startsAt, "EEEE, MMMM d 'at' h:mm a")
                      : "Check back during service hours for the next livestream."}
                  </p>

                  {countdown && (
                    <div className="mt-10 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        { label: "Days", value: countdown.days },
                        { label: "Hours", value: countdown.hours },
                        { label: "Minutes", value: countdown.minutes },
                        { label: "Seconds", value: countdown.seconds },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-[18px] border border-gold/20 bg-white/6 px-4 py-5 backdrop-blur-sm"
                        >
                          <p className="font-heading text-3xl font-bold text-white md:text-4xl">
                            {String(item.value).padStart(2, "0")}
                          </p>
                          <p className="mt-2 font-heading text-[11px] uppercase tracking-[0.22em] text-white/48">
                            {item.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Subscribe · Share · Socials */}
      <section className="bg-slate py-6 border-t border-white/8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
            {/* Left: Subscribe + Share + Prayer */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#FF0000] px-5 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_8px_24px_rgba(255,0,0,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-600"
              >
                <Radio className="h-4 w-4" />
                Subscribe on YouTube
              </a>
              <Link
                href="/prayer"
                className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-white/8 px-5 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-gold backdrop-blur-sm transition-all duration-200 hover:bg-white/14 hover:border-gold/55"
              >
                <Heart className="h-4 w-4" />
                Submit a Prayer Burden
              </Link>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/8 px-5 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/14"
              >
                <Share2 className="h-4 w-4" />
                {copied ? "Link Copied!" : "Share Stream"}
              </button>

              {isAuthenticated && watchStreak !== null && (
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-white/8 px-5 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-gold backdrop-blur-sm">
                  <Flame className="h-4 w-4" />
                  {watchStreak} {watchStreak === 1 ? "Live" : "Lives"} Watched
                </div>
              )}
            </div>

            {/* Right: Social handles */}
            <div className="flex items-center gap-1">
              <span className="mr-2 font-heading text-[10px] uppercase tracking-[0.2em] text-white/55">
                Follow Us
              </span>
              {[
                {
                  label: "YouTube",
                  href: CHANNEL_URL,
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  ),
                },
                {
                  label: "Instagram",
                  href: "https://www.instagram.com/the_ecclesia_embassy",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                    </svg>
                  ),
                },
                {
                  label: "Facebook",
                  href: "https://www.facebook.com/ecclesiaembassy",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  ),
                },
                {
                  label: "X / Twitter",
                  href: "https://x.com/ecclesiaembassy",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                },
                {
                  label: "TikTok",
                  href: "https://www.tiktok.com/@ecclesiaembassy",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
                    </svg>
                  ),
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white/55 transition-all duration-200 hover:border-gold/35 hover:bg-white/12 hover:text-white"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ecclesia Embassy Community CTA */}
      <section className="bg-[radial-gradient(circle_at_top,_rgba(201,168,76,0.18),_transparent_42%),linear-gradient(180deg,_#161129_0%,_#0E0B1E_100%)] py-14">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 md:px-8 text-center">
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            Community
          </p>
          <h3 className="mt-4 font-heading text-2xl font-bold text-white md:text-3xl">
            Join the conversation
          </h3>
          <p className="mt-3 font-body text-sm text-white/60 max-w-lg mx-auto">
            Connect with the community between services — share, pray, and grow together.
          </p>
          <Link
            href="/community"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-gold px-8 py-3 font-heading text-[13px] font-bold uppercase tracking-[0.15em] text-slate shadow-[0_14px_28px_rgba(201,168,76,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-dark"
          >
            Get Connected
          </Link>
        </div>
      </section>

      {/* Previous streams */}
      <section className="bg-[linear-gradient(180deg,_rgba(255,255,255,1)_0%,_rgba(250,250,248,0.96)_100%)] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <div className="mb-12 text-center">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.3em] text-purple-vivid">
              Archive
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-slate md:text-4xl">
              Past Livestreams
            </h2>
          </div>

          {isLoadingVideos ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[24px] border border-[rgba(14,11,30,0.08)] bg-white shadow-sm"
                >
                  <Skeleton className="aspect-video w-full rounded-none" />
                  <div className="space-y-3 p-5">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-2/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : archivedVideos.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {archivedVideos.map((video) => (
                <article
                  key={video.id}
                  className="soft-card overflow-hidden rounded-[24px] transition-transform duration-200 hover:-translate-y-1"
                >
                  <button
                    onClick={() => setActiveStream(video)}
                    className="group block w-full text-left"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-lavender">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized
                        style={{ opacity: 1 }}
                        className="object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-slate/30 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-lg">
                          <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="line-clamp-2 font-heading text-sm font-bold leading-6 text-slate">
                        {video.title}
                      </h3>
                      <p className="mt-2 font-body text-xs text-gray-text">
                        {video.publishedAt
                          ? format(new Date(video.publishedAt), "MMMM d, yyyy")
                          : "Date unavailable"}
                      </p>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center font-body italic text-gray-text">
              No previous streams found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
