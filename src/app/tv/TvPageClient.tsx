"use client";

import { useEffect, useState } from "react";
import HlsPlayer from "@/components/live/HlsPlayer";
import { Skeleton } from "@/components/ui/Skeleton";
import { livestream } from "@/lib/api";
import { normalizeStreamUrl } from "@/lib/streams";

export default function TvPageClient() {
  const [tvUrl, setTvUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    livestream
      .getConfig()
      .then((config) => {
        if (mounted) setTvUrl(normalizeStreamUrl(config?.tvUrl));
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="bg-slate pt-16 pb-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          Ecclesia TV
        </p>
        <h1 className="mt-3 mb-8 font-heading text-3xl font-bold text-white md:text-4xl">
          Watch Ecclesia TV
        </h1>

        {loading ? (
          <Skeleton className="aspect-video w-full rounded-[20px] bg-white/8" />
        ) : tvUrl ? (
          <>
            <HlsPlayer src={tvUrl} title="Ecclesia TV" />
            <p className="mt-5 max-w-2xl font-body text-sm text-white/60">
              Ecclesia TV carries our services live and our programmes the rest of
              the time.
            </p>
          </>
        ) : (
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-10 text-center">
            <p className="font-heading text-lg font-bold text-white">
              Ecclesia TV isn&apos;t available yet
            </p>
            <p className="mt-2 font-body text-sm text-white/60">
              It will appear here once the channel is switched on.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
