"use client";

import { useRef, useState } from "react";

interface RadioPlayerProps {
  /** https URL of the audio stream. */
  src: string;
}

// A paused live stream resumes from whatever the browser buffered before the
// pause, which for a radio is minutes behind. Past this, resume from the live
// edge instead.
const STALE_AFTER_MS = 5_000;

export default function RadioPlayer({ src }: RadioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const pausedAt = useRef<number | null>(null);
  const [failed, setFailed] = useState(false);

  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setFailed(false);

    const stale =
      pausedAt.current !== null && Date.now() - pausedAt.current > STALE_AFTER_MS;
    pausedAt.current = null;
    if (stale) {
      audio.load();
      audio.play().catch(() => {});
    }
  };

  return (
    <div>
      <audio
        ref={audioRef}
        className="w-full"
        controls
        preload="none"
        src={src}
        aria-label="Ecclesia Radio"
        onPlay={handlePlay}
        onPause={() => {
          pausedAt.current = Date.now();
        }}
        onError={() => setFailed(true)}
      />
      {failed && (
        <p className="mt-3 font-body text-sm text-error" role="alert">
          Couldn&apos;t reach the station. Check your connection and press play to
          try again.
        </p>
      )}
    </div>
  );
}
