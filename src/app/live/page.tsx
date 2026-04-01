"use client";

import { useState, useEffect, useRef } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { livestream } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { FadeIn, ScaleIn } from "@/components/ui/Motion";
import { Radio, Clock, Calendar } from "lucide-react";

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
}

const CountdownTimer = () => {
  const [countdown, setCountdown] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const hour = now.getHours();

      let nextService = new Date();

      // Sunday 9AM
      if (dayOfWeek === 0 && hour < 9) {
        nextService.setHours(9, 0, 0, 0);
      } else if (dayOfWeek === 0) {
        nextService.setDate(nextService.getDate() + 3); // Tuesday
        nextService.setHours(18, 0, 0, 0);
      }
      // Monday
      else if (dayOfWeek === 1) {
        nextService.setDate(nextService.getDate() + 1); // Tuesday
        nextService.setHours(18, 0, 0, 0);
      }
      // Tuesday before 6PM
      else if (dayOfWeek === 2 && hour < 18) {
        nextService.setHours(18, 0, 0, 0);
      }
      // Tuesday after 6PM or Wednesday-Thursday
      else if (dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4) {
        nextService.setDate(nextService.getDate() + (5 - dayOfWeek)); // Friday
        nextService.setHours(18, 0, 0, 0);
      }
      // Friday before 6PM
      else if (dayOfWeek === 5 && hour < 18) {
        nextService.setHours(18, 0, 0, 0);
      }
      // Friday after 6PM or Saturday
      else {
        nextService.setDate(nextService.getDate() + (7 - dayOfWeek + 1)); // Next Sunday
        nextService.setHours(9, 0, 0, 0);
      }

      const diff = nextService.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown({
        days,
        hours,
        minutes,
        seconds,
        isLive: false,
      });
    };

    calculateCountdown();

    intervalRef.current = setInterval(calculateCountdown, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div>
      <div className="flex gap-4 justify-center mb-8">
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-4xl font-bold text-white">{countdown.days}</div>
          <div className="text-xs text-white/50 uppercase mt-2">Days</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-4xl font-bold text-white">{countdown.hours}</div>
          <div className="text-xs text-white/50 uppercase mt-2">Hours</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-4xl font-bold text-white">
            {countdown.minutes}
          </div>
          <div className="text-xs text-white/50 uppercase mt-2">Minutes</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-4xl font-bold text-white">{countdown.seconds}</div>
          <div className="text-xs text-white/50 uppercase mt-2">Seconds</div>
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-2xl font-heading text-white mb-2">Next Service</h3>
        <p className="text-white/70">Sunday 9:00 AM</p>
      </div>
    </div>
  );
};

export default function LivePage() {
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [youtubeId, setYoutubeId] = useState<string | null>(null);

  useEffect(() => {
    const checkLiveStatus = async () => {
      try {
        const data = await livestream.getConfig();
        setIsLive(data.isLive || false);
        setYoutubeId(data.embedUrl || null);
      } catch (error) {
        console.error("Failed to fetch livestream status:", error);
        setIsLive(false);
      } finally {
        setLoading(false);
      }
    };

    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Live Player Section */}
      <div className="bg-slate min-h-[60vh] flex items-center justify-center">
        <FadeIn>
          <div className="w-full max-w-4xl px-4">
            {loading ? (
              <Skeleton className="w-full aspect-video rounded-xl" />
            ) : isLive && youtubeId ? (
              <div className="relative">
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-error/90 rounded-full px-4 py-1 flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-bold">LIVE</span>
                  </div>
                </div>
                <iframe
                  width="100%"
                  height="600"
                  src={youtubeId?.includes('http') ? youtubeId : `https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                  className="rounded-xl shadow-2xl aspect-video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Ecclesia Embassy Live Stream"
                ></iframe>
              </div>
            ) : (
              <ScaleIn>
                <CountdownTimer />
              </ScaleIn>
            )}
          </div>
        </FadeIn>
      </div>

      {/* Service Schedule Section */}
      <SectionWrapper variant="dark-slate">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading text-white mb-4">
            Our Service Schedule
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Join us in person or online for worship and community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sunday Service */}
          <FadeIn delay={0.1}>
            <div className="bg-white/5 rounded-xl p-8 border border-purple/20 hover:border-purple/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-purple-vivid" />
                <h3 className="text-xl font-heading text-white">Sunday</h3>
              </div>
              <p className="text-white/70 mb-2">Worship & Teaching</p>
              <p className="text-2xl font-bold text-purple-vivid">9:00 AM</p>
            </div>
          </FadeIn>

          {/* Tuesday Service */}
          <FadeIn delay={0.2}>
            <div className="bg-white/5 rounded-xl p-8 border border-purple/20 hover:border-purple/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-purple-vivid" />
                <h3 className="text-xl font-heading text-white">Tuesday</h3>
              </div>
              <p className="text-white/70 mb-2">Evening Prayer</p>
              <p className="text-2xl font-bold text-purple-vivid">6:00 PM</p>
            </div>
          </FadeIn>

          {/* Friday Service */}
          <FadeIn delay={0.3}>
            <div className="bg-white/5 rounded-xl p-8 border border-purple/20 hover:border-purple/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Radio className="w-6 h-6 text-purple-vivid" />
                <h3 className="text-xl font-heading text-white">Friday</h3>
              </div>
              <p className="text-white/70 mb-2">Community Gathering</p>
              <p className="text-2xl font-bold text-purple-vivid">6:00 PM</p>
            </div>
          </FadeIn>
        </div>
      </SectionWrapper>
    </>
  );
}
