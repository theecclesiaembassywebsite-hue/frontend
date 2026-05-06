"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { media, livestream, serviceSchedule } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";

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

interface VideoMessage {
  id: string;
  title: string;
  embedUrl?: string;
  youtubeUrl?: string;
  date?: string;
  createdAt?: string;
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

function toEmbedUrl(url?: string | null) {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;

  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/
  );

  if (match?.[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return `https://www.youtube.com/embed/${url}`;
  }

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

function LiveHeroSkeleton() {
  return (
    <section className="bg-[#0E0B1E] pt-24 pb-0">
      <div className="mx-auto w-full max-w-6xl px-4">
        <Skeleton className="aspect-video w-full rounded-t-lg border-x-2 border-t-2 border-[#C9A84C]/30 bg-white/8" />
      </div>
    </section>
  );
}

export default function LivePage() {
  const [config, setConfig] = useState<LivestreamConfig | null>(null);
  const [services, setServices] = useState<ServiceScheduleEntry[]>([]);
  const [videos, setVideos] = useState<VideoMessage[]>([]);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [now, setNow] = useState(() => new Date());

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
        const data = await media.getVideoMessages();
        if (!isMounted) return;
        setVideos((data ?? []).slice(0, 6));
      } catch {
        if (!isMounted) return;
        setVideos([]);
      } finally {
        if (isMounted) {
          setIsLoadingVideos(false);
        }
      }
    };

    fetchConfig();
    fetchServices();
    fetchVideos();

    const configIntervalId = window.setInterval(fetchConfig, 30000);
    const clockIntervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      isMounted = false;
      window.clearInterval(configIntervalId);
      window.clearInterval(clockIntervalId);
    };
  }, []);

  const liveEmbedUrl = toEmbedUrl(config?.embedUrl);
  const nextUpcomingService = getNextUpcomingService(config, services, now);
  const countdown = getCountdownParts(nextUpcomingService?.startsAt ?? null, now);
  const showLiveStream = Boolean(config?.isLive && liveEmbedUrl);
  const isLoadingHero = isLoadingConfig || isLoadingServices;

  return (
    <div className="w-full bg-[#FAFAF8] text-[#0E0B1E]">
      {isLoadingHero ? (
        <LiveHeroSkeleton />
      ) : (
        <section className="relative bg-[#0E0B1E] pt-24 pb-0">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="relative aspect-video overflow-hidden rounded-t-lg border-x-2 border-t-2 border-[#C9A84C]/30 bg-black shadow-2xl">
              {showLiveStream && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-[3px] bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-[0.3em] text-white">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  Live Now
                </div>
              )}

              {showLiveStream ? (
                <iframe
                  src={liveEmbedUrl}
                  title="The Ecclesia Embassy livestream"
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(201,168,76,0.22),_transparent_45%),linear-gradient(180deg,_#161129_0%,_#0E0B1E_100%)] px-6 text-center text-[#FAFAF8]">
                  <p className="mb-4 rounded-full border border-[#C9A84C]/40 bg-white/5 px-4 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.28em] text-[#C9A84C]">
                    Next Service Countdown
                  </p>
                  <h2 className="mb-3 font-heading text-3xl text-[#C9A84C] md:text-4xl">
                    {nextUpcomingService?.name ?? "We are offline"}
                  </h2>
                  <p className="max-w-xl text-sm text-white/70 md:text-base">
                    {nextUpcomingService
                      ? format(nextUpcomingService.startsAt, "EEEE, MMMM d 'at' h:mm a")
                      : "Check back during service hours for the next livestream."}
                  </p>

                  {countdown && (
                    <div className="mt-8 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        { label: "Days", value: countdown.days },
                        { label: "Hours", value: countdown.hours },
                        { label: "Minutes", value: countdown.minutes },
                        { label: "Seconds", value: countdown.seconds },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-lg border border-[#C9A84C]/25 bg-white/6 px-4 py-5 backdrop-blur-sm"
                        >
                          <p className="font-heading text-3xl font-bold text-white md:text-4xl">
                            {String(item.value).padStart(2, "0")}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/50">
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

      <section className="border-b border-[#C9A84C]/20 bg-[#E8E6F0] py-12">
        <div className="mx-auto px-4 text-center">
          <h3 className="mb-4 font-heading text-2xl md:text-3xl">
            Join the conversation in Ecclesia Nation
          </h3>
          <Link
            href="/nation"
            className="inline-flex items-center justify-center rounded-[3px] bg-[#0E0B1E] px-8 py-3 font-heading text-sm font-bold uppercase tracking-[0.18em] text-[#C9A84C] transition-colors hover:bg-[#1A1530]"
          >
            Enter the Nation
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-10 text-center font-heading text-3xl md:text-4xl">
          Previous Streams
        </h2>

        {isLoadingVideos ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded border border-[#C9A84C]/20 bg-white shadow-sm"
              >
                <Skeleton className="aspect-video w-full rounded-none" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => {
              const embedUrl = toEmbedUrl(video.embedUrl || video.youtubeUrl);
              const publishedAt = video.date || video.createdAt;

              return (
                <article
                  key={video.id}
                  className="overflow-hidden rounded border border-[#C9A84C]/20 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="aspect-video w-full bg-gray-100">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={video.title}
                        className="h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[#F3F1F8] px-6 text-center text-sm text-[#8A8A90]">
                        Video unavailable
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="mb-1 line-clamp-2 font-heading text-sm leading-6">
                      {video.title}
                    </h3>
                    <p className="text-xs text-[#8A8A90]">
                      {publishedAt
                        ? format(new Date(publishedAt), "MMMM d, yyyy")
                        : "Date unavailable"}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center italic text-[#8A8A90]">
            No previous streams found.
          </div>
        )}
      </section>
    </div>
  );
}
