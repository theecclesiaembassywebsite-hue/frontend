"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import { useState, useEffect } from "react";
import { Radio, Clock } from "lucide-react";
import { livestream } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  });

  return (
    <div className="flex items-center justify-center gap-4">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} className="flex flex-col items-center">
          <span className="font-heading text-4xl font-bold text-white md:text-5xl">
            {String(value).padStart(2, "0")}
          </span>
          <span className="mt-1 font-body text-xs uppercase tracking-wider text-white/50">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function LivePage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await livestream.getConfig();
        setConfig(data || { isLive: false, embedUrl: "", nextService: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch livestream config");
        setConfig({ isLive: false, embedUrl: "", nextService: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const isLive = config?.isLive || false;
  const embedUrl = config?.embedUrl || "";
  const nextService = config?.nextService ? new Date(config.nextService) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-near-black" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Radio
              size={20}
              className={isLive ? "text-error animate-pulse" : "text-white/40"}
            />
            <span
              className={`font-heading text-sm font-bold uppercase tracking-wider ${
                isLive ? "text-error" : "text-white/40"
              }`}
            >
              {isLive ? "Live Now" : "Offline"}
            </span>
          </div>
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            {isLive ? "Watch Live" : "Livestream"}
          </h1>
        </div>
      </section>

      {loading ? (
        <SectionWrapper variant="dark-slate">
          <div className="mx-auto max-w-4xl">
            <Skeleton variant="card" className="aspect-video" />
          </div>
        </SectionWrapper>
      ) : error ? (
        <SectionWrapper variant="dark-purple">
          <div className="text-center">
            <p className="font-body text-base text-error">{error}</p>
          </div>
        </SectionWrapper>
      ) : isLive ? (
        /* Live player */
        <SectionWrapper variant="dark-slate">
          <div className="mx-auto max-w-4xl">
            <div className="relative aspect-video overflow-hidden rounded-[8px] bg-near-black shadow-xl">
              <iframe
                src={embedUrl}
                title="The Ecclesia Embassy Live Service"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
            <p className="mt-4 text-center font-body text-sm text-white/50">
              Chat with us on YouTube Live during the service
            </p>
          </div>
        </SectionWrapper>
      ) : (
        /* Countdown */
        <SectionWrapper variant="dark-purple">
          <div className="text-center">
            <Clock className="mx-auto mb-4 h-12 w-12 text-purple-vivid" />
            <h2 className="font-heading text-[28px] font-bold text-white mb-2">
              Next Service
            </h2>
            <p className="font-body text-sm text-white/60 mb-8">
              {nextService.toLocaleDateString("en-NG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <CountdownTimer targetDate={nextService} />
            <p className="mt-8 font-serif text-base italic text-white/50">
              The livestream will appear here automatically when the service begins.
            </p>
          </div>
        </SectionWrapper>
      )}

      {/* Service Schedule Reminder */}
      <SectionWrapper variant="off-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-xl font-bold text-slate mb-4">
            Weekly Service Schedule
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { day: "Sunday", service: "Word & Life Service" },
              { day: "Tuesday", service: "Prayer & Intercession" },
              { day: "Friday", service: "Worship Encounter" },
            ].map((s) => (
              <div
                key={s.day}
                className="rounded-[8px] bg-white p-4 shadow-sm border border-gray-border"
              >
                <p className="font-heading text-sm font-bold text-purple">
                  {s.day}
                </p>
                <p className="font-body text-sm text-gray-text">{s.service}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
