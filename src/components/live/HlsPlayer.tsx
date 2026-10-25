"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

type PlayerState = "loading" | "ready" | "error";

interface HlsPlayerProps {
  /** https URL of an HLS playlist (.m3u8). */
  src: string;
  title?: string;
}

/**
 * Plays an HLS stream. Safari and iOS play HLS natively; every other browser
 * gets it through hls.js, which is imported on demand so it only costs pages
 * that actually show a player.
 */
export default function HlsPlayer({ src, title = "Ecclesia TV" }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<PlayerState>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    let hls: { destroy: () => void } | null = null;
    setState("loading");

    const onReady = () => setState("ready");
    const onFail = () => {
      if (!cancelled) setState("error");
    };
    const tryPlay = () => {
      // Browsers block unmuted autoplay; the controls are visible, so the
      // viewer just taps play instead.
      video.play().catch(() => {});
    };

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("playing", onReady);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.addEventListener("error", onFail);
      video.src = src;
      tryPlay();
    } else {
      void import("hls.js")
        .then(({ default: Hls }) => {
          if (cancelled) return;
          if (!Hls.isSupported()) {
            onFail();
            return;
          }
          // The worker is built from a blob: URL, which the site's CSP does
          // not allow; hls.js runs fine on the main thread without it.
          const instance = new Hls({ enableWorker: false });
          hls = instance;
          instance.on(Hls.Events.ERROR, (_event, data) => {
            // A fatal error here means the channel is offline or unreachable.
            // Surface it with a retry rather than looping requests against a
            // server that is down.
            if (data.fatal) onFail();
          });
          instance.on(Hls.Events.MANIFEST_PARSED, tryPlay);
          instance.loadSource(src);
          instance.attachMedia(video);
        })
        .catch(onFail);
    }

    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("playing", onReady);
      video.removeEventListener("error", onFail);
      hls?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [src, attempt]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[20px] border-2 border-gold/20 bg-black shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
      <video
        ref={videoRef}
        className="h-full w-full"
        controls
        playsInline
        title={title}
        aria-label={title}
      />
      {state === "loading" && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50"
          role="status"
        >
          <span className="font-heading text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
            Loading stream…
          </span>
        </div>
      )}
      {state === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 p-6 text-center">
          <p className="font-heading text-base font-bold text-white">
            {title} is unavailable right now
          </p>
          <p className="font-body text-sm text-white/70">
            Check your connection, or try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2 font-heading text-[12px] font-bold uppercase tracking-[0.15em] text-slate transition-colors hover:bg-gold-dark"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
