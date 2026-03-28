"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import AudioPlayer from "@/components/media/AudioPlayer";
import Button from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { Music, Play } from "lucide-react";
import { media } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MusicPage() {
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await media.getMusic();
        setTracks(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch music");
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMusic();
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            Ecclesia Music
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            Original worship music from The Ecclesia Embassy
          </h6>
        </div>
      </section>

      {/* Album Art + Track List */}
      <SectionWrapper variant="white">
        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Skeleton variant="card" className="aspect-square rounded-[16px]" />
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="font-body text-base text-error">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Album artwork placeholder */}
            <div className="flex aspect-square items-center justify-center rounded-[16px] bg-purple-dark shadow-lg">
              <Music className="h-24 w-24 text-white/20" />
            </div>

            {/* Track listing */}
            <div className="md:col-span-2">
              <h2 className="font-heading text-[28px] font-bold text-slate mb-1">
                Worship Sessions
              </h2>
              <p className="text-body-small mb-6">The Ecclesia Embassy Music Ministry</p>

              {tracks.length === 0 ? (
                <p className="text-body-small text-gray-text">No music tracks available.</p>
              ) : (
                <div className="flex flex-col divide-y divide-gray-border">
                  {tracks.map((track, i) => (
                    <div key={track.id}>
                      <div className="flex items-center gap-4 py-3">
                        <span className="font-heading text-sm text-gray-text w-6 text-right">
                          {i + 1}
                        </span>
                        <button
                          onClick={() => setActiveTrack(activeTrack === track.id ? null : track.id)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-light hover:bg-purple hover:text-white text-purple transition-colors"
                        >
                          <Play size={14} className="ml-0.5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="font-heading text-sm font-semibold text-slate truncate">
                            {track.title}
                          </p>
                          <p className="text-[12px] font-body text-gray-text">{track.album || "Album"}</p>
                        </div>
                        <span className="text-body-small shrink-0">{track.duration || "—"}</span>
                        {track.price ? (
                          <Button variant="ghost" className="text-[11px] py-1 px-2 min-w-0">
                            &#8358;{track.price}
                          </Button>
                        ) : (
                          <span className="text-[11px] font-heading font-semibold text-success">
                            Free
                          </span>
                        )}
                      </div>

                      {activeTrack === track.id && (
                        <div className="pb-3 pl-14">
                          <AudioPlayer src={track.musicUrl || track.audioUrl} title={track.title} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </SectionWrapper>
    </>
  );
}
