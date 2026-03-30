"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";
import { engagement } from "@/lib/api";

interface AudioPlayerProps {
  src: string;
  title: string;
  speaker?: string;
}

export default function AudioPlayer({ src, title, speaker }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const recordWatch = useCallback(() => {
    engagement.recordWatch().catch(() => {});
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
      recordWatch();
    }
    setPlaying(!playing);
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const time = Number(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  }

  function skip(seconds: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
  }

  function cycleSpeed() {
    const audio = audioRef.current;
    if (!audio) return;
    const speeds = [1, 1.25, 1.5, 1.75, 2];
    const idx = speeds.indexOf(playbackRate);
    const next = speeds[(idx + 1) % speeds.length];
    audio.playbackRate = next;
    setPlaybackRate(next);
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <div className="rounded-[8px] bg-near-black p-4 text-white">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Title */}
      <div className="mb-3">
        <p className="font-heading text-sm font-semibold truncate">{title}</p>
        {speaker && (
          <p className="font-body text-xs text-white/50">{speaker}</p>
        )}
      </div>

      {/* Progress bar */}
      <input
        type="range"
        min={0}
        max={duration || 0}
        value={currentTime}
        onChange={seek}
        className="w-full h-1 rounded-full appearance-none bg-white/20 cursor-pointer accent-purple-vivid"
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-white/40">{formatTime(currentTime)}</span>
        <span className="text-[10px] text-white/40">{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <button onClick={() => skip(-15)} className="text-white/60 hover:text-white transition-colors">
            <SkipBack size={18} />
          </button>
          <button
            onClick={togglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-purple hover:bg-purple-vivid transition-colors"
          >
            {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
          <button onClick={() => skip(15)} className="text-white/60 hover:text-white transition-colors">
            <SkipForward size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={cycleSpeed}
            className="rounded-[4px] bg-white/10 px-2 py-0.5 text-[10px] font-heading font-semibold hover:bg-white/20 transition-colors"
          >
            {playbackRate}x
          </button>
          <button
            onClick={() => {
              setMuted(!muted);
              if (audioRef.current) audioRef.current.muted = !muted;
            }}
            className="text-white/60 hover:text-white transition-colors"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
