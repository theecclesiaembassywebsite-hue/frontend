"use client";

import { useEffect, useState } from "react";
import RadioPlayer from "@/components/live/RadioPlayer";
import { Skeleton } from "@/components/ui/Skeleton";
import { livestream } from "@/lib/api";
import { normalizeStreamUrl } from "@/lib/streams";

export default function RadioPageClient() {
  const [radioUrl, setRadioUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    livestream
      .getConfig()
      .then((config) => {
        if (mounted) setRadioUrl(normalizeStreamUrl(config?.radioUrl));
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
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 md:px-8">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          Ecclesia Radio
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl">
          Listen to Ecclesia Radio
        </h1>
        <p className="mt-3 mb-8 font-body text-sm text-white/60">
          Worship, teaching and prayer, around the clock.
        </p>

        <div className="rounded-[20px] border-2 border-gold/20 bg-white/5 p-6">
          {loading ? (
            <Skeleton className="h-12 w-full rounded-full bg-white/8" />
          ) : radioUrl ? (
            <RadioPlayer src={radioUrl} />
          ) : (
            <div className="py-4 text-center">
              <p className="font-heading text-lg font-bold text-white">
                Ecclesia Radio isn&apos;t available yet
              </p>
              <p className="mt-2 font-body text-sm text-white/60">
                It will appear here once the station is switched on.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
