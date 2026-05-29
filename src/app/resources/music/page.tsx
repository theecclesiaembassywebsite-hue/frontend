'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import { media } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { FadeIn } from '@/components/ui/Motion';
import { ExternalLink, Headphones, Music, Pause, Play, Search, Video, X } from 'lucide-react';

interface MusicTrack {
  id: string;
  title: string;
  album: string;
  duration: string;
  artworkUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function ytId(url: string): string | null {
  return url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1] ?? null;
}

function spotifyEmbed(url: string): { path: string; isArtist: boolean } | null {
  const album = url.match(/spotify\.com\/album\/([A-Za-z0-9]+)/)?.[1];
  if (album) return { path: `album/${album}`, isArtist: false };
  const artist = url.match(/spotify\.com\/artist\/([A-Za-z0-9]+)/)?.[1];
  if (artist) return { path: `artist/${artist}`, isArtist: true };
  return null;
}

type AudioType = 'spotify' | 'boomplay' | 'direct' | 'other';
function audioType(url: string): AudioType {
  if (url.includes('spotify.com')) return 'spotify';
  if (url.includes('boomplay.com')) return 'boomplay';
  if (/\.(mp3|wav|ogg|aac|m4a|flac)(\?|$)/i.test(url)) return 'direct';
  return 'other';
}

function groupByAlbum(tracks: MusicTrack[]): [string, MusicTrack[]][] {
  const map = new Map<string, MusicTrack[]>();
  for (const t of tracks) {
    const arr = map.get(t.album) ?? [];
    arr.push(t);
    map.set(t.album, arr);
  }
  return [...map.entries()];
}

// ── useModalKeyClose ─────────────────────────────────────────────────────────

function useModalKeyClose(onClose: () => void) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);
}

// ── AudioModal ───────────────────────────────────────────────────────────────

function AudioModal({ track, onClose }: { track: MusicTrack; onClose: () => void }) {
  useModalKeyClose(onClose);
  const type = track.audioUrl ? audioType(track.audioUrl) : 'other';
  const spEmbed = type === 'spotify' && track.audioUrl ? spotifyEmbed(track.audioUrl) : null;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  function togglePlay() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) { el.play(); setPlaying(true); }
    else { el.pause(); setPlaying(false); }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-[20px] bg-[#0E0B1E] shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C9A84C]">
              {track.album}
            </p>
            <h2 className="mt-1 line-clamp-2 font-heading text-base font-bold text-white">
              {track.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close player"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Spotify embed */}
        {spEmbed && (
          <div className="px-5 pb-5">
            <iframe
              src={`https://open.spotify.com/embed/${spEmbed.path}?utm_source=generator&theme=0`}
              width="100%"
              height="352"
              style={{ borderRadius: '12px', border: 0 }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={track.album}
            />
            <p className="mt-3 font-body text-[11px] leading-relaxed text-white/40">
              {spEmbed.isArtist
                ? <>Search for <span className="font-semibold text-white/65">"{track.title}"</span> in the Spotify app for full access. 30-second previews are free below.</>
                : <>Select <span className="font-semibold text-white/65">"{track.title}"</span> in the player above. 30-second previews are free — sign in to Spotify for full playback.</>}
            </p>
          </div>
        )}

        {/* HTML5 audio player (direct files) */}
        {type === 'direct' && track.audioUrl && (
          <div className="px-5 pb-6">
            {/* Hidden native audio */}
            <audio
              ref={audioRef}
              src={track.audioUrl}
              onTimeUpdate={() => {
                const el = audioRef.current;
                if (el && el.duration)
                  setProgress((el.currentTime / el.duration) * 100);
              }}
              onEnded={() => setPlaying(false)}
            />
            {/* Artwork + controls */}
            <div className="flex items-center gap-4 rounded-2xl bg-white/6 p-4">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#1a1630]">
                {track.artworkUrl ? (
                  <img src={track.artworkUrl} alt={track.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Music className="h-7 w-7 text-[#C9A84C]" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm font-bold text-white">{track.title}</p>
                <p className="mt-0.5 font-body text-xs text-white/50">{track.album}</p>
                {/* Progress bar */}
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-[#C9A84C] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <button
                onClick={togglePlay}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#C9A84C] text-[#0E0B1E] transition hover:bg-[#d4b050]"
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing
                  ? <Pause className="h-5 w-5 fill-current" />
                  : <Play className="h-5 w-5 fill-current" />}
              </button>
            </div>
            {track.duration && (
              <p className="mt-2 text-center font-body text-xs text-white/35">{track.duration}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── VideoModal ────────────────────────────────────────────────────────────────

function VideoModal({ track, onClose }: { track: MusicTrack; onClose: () => void }) {
  useModalKeyClose(onClose);
  const id = track.videoUrl ? ytId(track.videoUrl) : null;
  const src = id
    ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
    : (track.videoUrl ?? '');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[20px] bg-[#0E0B1E] shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C9A84C]">
              {track.album}
            </p>
            <h2 className="mt-1 line-clamp-2 font-heading text-base font-bold text-white">
              {track.title}
            </h2>
          </div>
          <div className="flex flex-shrink-0 items-center gap-3 pt-0.5">
            {track.videoUrl && (
              <a
                href={track.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80 transition hover:bg-white/18"
              >
                YouTube <ExternalLink className="h-3 w-3" />
              </a>
            )}
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
            src={src}
            title={track.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}

// ── AlbumAudioSection ─────────────────────────────────────────────────────────

function AlbumAudioSection({
  albumName,
  tracks,
  onPlayAudio,
}: {
  albumName: string;
  tracks: MusicTrack[];
  onPlayAudio: (t: MusicTrack) => void;
}) {
  const artwork = tracks.find((t) => t.artworkUrl)?.artworkUrl;
  return (
    <section>
      <div className="mb-4 flex items-center gap-4">
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-[#F0EEF8]">
          {artwork ? (
            <img src={artwork} alt={albumName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Music className="h-6 w-6 text-[#C9A84C]" />
            </div>
          )}
        </div>
        <div>
          <h3 className="font-heading text-base font-bold text-[#0E0B1E]">{albumName}</h3>
          <p className="font-body text-xs text-[#A8A4B8]">
            {tracks.length} track{tracks.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[rgba(14,11,30,0.08)]">
        {tracks.map((track, i) => {
          const type = track.audioUrl ? audioType(track.audioUrl) : 'other';
          const canEmbed = type === 'spotify' || type === 'direct';

          return (
            <div
              key={track.id}
              className={`flex items-center gap-4 bg-white px-5 py-3.5 transition-colors hover:bg-[#FAFAF8] ${
                i < tracks.length - 1 ? 'border-b border-[rgba(14,11,30,0.06)]' : ''
              }`}
            >
              {/* Thumbnail */}
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[#F0EEF8]">
                {track.artworkUrl ? (
                  <img src={track.artworkUrl} alt={track.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Music className="h-4 w-4 text-[#C9A84C]" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm font-semibold text-[#0E0B1E]">
                  {track.title}
                </p>
                {track.duration && (
                  <p className="font-body text-xs text-[#A8A4B8]">{track.duration}</p>
                )}
              </div>

              {/* Action */}
              {track.audioUrl && (
                canEmbed ? (
                  <button
                    onClick={() => onPlayAudio(track)}
                    className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 font-heading text-[11px] font-bold uppercase tracking-[0.14em] transition-opacity hover:opacity-80 ${
                      type === 'spotify'
                        ? 'bg-[#1DB954] text-white'
                        : 'bg-[#C9A84C] text-[#0E0B1E]'
                    }`}
                  >
                    <Play className="h-3 w-3 fill-current" />
                    {type === 'spotify' ? 'Spotify' : 'Play'}
                  </button>
                ) : (
                  <a
                    href={track.audioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[#F26522] px-3.5 py-1.5 font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Boomplay
                  </a>
                )
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── AlbumVideoSection ─────────────────────────────────────────────────────────

function AlbumVideoSection({
  albumName,
  tracks,
  onPlay,
}: {
  albumName: string;
  tracks: MusicTrack[];
  onPlay: (t: MusicTrack) => void;
}) {
  return (
    <section>
      <div className="mb-4">
        <h3 className="font-heading text-base font-bold text-[#0E0B1E]">{albumName}</h3>
        <p className="font-body text-xs text-[#A8A4B8]">
          {tracks.length} video{tracks.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tracks.map((track) => {
          const id = track.videoUrl ? ytId(track.videoUrl) : null;
          const thumb = id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : track.artworkUrl;
          return (
            <article
              key={track.id}
              className="overflow-hidden rounded-[20px] border border-[rgba(14,11,30,0.08)] bg-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
            >
              <button onClick={() => onPlay(track)} className="group block w-full text-left">
                <div className="relative aspect-video w-full overflow-hidden bg-[#E8E6F0]">
                  {thumb && (
                    <img src={thumb} alt={track.title} className="h-full w-full object-cover" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0E0B1E]/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-lg">
                      <Play className="h-6 w-6 fill-white text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 font-heading text-sm font-bold text-[#0E0B1E]">{track.title}</p>
                  <p className="mt-1 font-body text-xs text-[#8A8A90]">{track.album}</p>
                  {track.duration && (
                    <p className="mt-0.5 font-body text-xs text-[#A8A4B8]">{track.duration}</p>
                  )}
                </div>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EcclesiaMusicPage() {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<'audio' | 'video'>('audio');
  const [query, setQuery] = useState('');
  const [activeAudio, setActiveAudio] = useState<MusicTrack | null>(null);
  const [activeVideo, setActiveVideo] = useState<MusicTrack | null>(null);

  useEffect(() => {
    document.title = 'Music | The Ecclesia Embassy';
    media
      .getMusic()
      .then((data) => setTracks(data ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.album.toLowerCase().includes(q)
    );
  }, [tracks, query]);

  const audioTracks = useMemo(() => filtered.filter((t) => t.audioUrl), [filtered]);
  const videoTracks = useMemo(() => filtered.filter((t) => t.videoUrl), [filtered]);
  const groupedAudio = useMemo(() => groupByAlbum(audioTracks), [audioTracks]);
  const groupedVideo = useMemo(() => groupByAlbum(videoTracks), [videoTracks]);

  return (
    <main className="min-h-screen">
      {activeAudio && (
        <AudioModal track={activeAudio} onClose={() => setActiveAudio(null)} />
      )}
      {activeVideo && (
        <VideoModal track={activeVideo} onClose={() => setActiveVideo(null)} />
      )}

      {/* Hero */}
      <section
        className="relative flex h-80 items-center justify-center overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&q=80)',
        }}
      >
        <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
        <div className="relative z-10 px-4 text-center">
          <div className="mb-4 flex justify-center">
            <Music className="h-14 w-14 text-[#C9A84C]" />
          </div>
          <h1 className="mb-2 font-heading text-5xl font-bold text-white">Ecclesia Music</h1>
          <p className="font-body text-base text-white/70">Worship in spirit and truth</p>
        </div>
      </section>

      <SectionWrapper variant="white">
        <FadeIn>
          <div className="mx-auto max-w-5xl">
            {/* Search */}
            <div className="relative mb-8">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A8A4B8]" />
              <input
                type="search"
                placeholder="Search tracks or albums…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-full border border-[#E2E0EC] bg-[#FAFAF8] py-3 pl-11 pr-10 font-body text-sm text-[#0E0B1E] placeholder:text-[#A8A4B8] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A8A4B8] hover:text-[#0E0B1E]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="mb-8 flex gap-1 border-b border-[#E8E6F0]">
              {[
                { key: 'audio' as const, label: 'Audio Tracks', count: audioTracks.length, Icon: Headphones },
                { key: 'video' as const, label: 'Videos', count: videoTracks.length, Icon: Video },
              ].map(({ key, label, count, Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`-mb-px flex items-center gap-2 border-b-2 px-1 pb-3 pr-5 font-heading text-[12px] font-bold uppercase tracking-[0.14em] transition-colors ${
                    tab === key
                      ? 'border-[#C9A84C] text-[#0E0B1E]'
                      : 'border-transparent text-[#A8A4B8] hover:text-[#5C5870]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  <span
                    className={`rounded-full px-2 py-0.5 font-body text-[11px] ${
                      tab === key
                        ? 'bg-[#C9A84C]/15 text-[#C9A84C]'
                        : 'bg-[#F0EEF8] text-[#A8A4B8]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-[62px] w-full rounded-xl" />
                ))}
              </div>
            ) : tab === 'audio' ? (
              audioTracks.length === 0 ? (
                <div className="py-16 text-center">
                  <Music className="mx-auto mb-4 h-10 w-10 text-[#E8E6F0]" />
                  <p className="font-body text-[#8A8A90]">
                    {query ? `No tracks found for "${query}"` : 'No audio tracks available.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-10">
                  {groupedAudio.map(([albumName, albumTracks]) => (
                    <AlbumAudioSection
                      key={albumName}
                      albumName={albumName}
                      tracks={albumTracks}
                      onPlayAudio={setActiveAudio}
                    />
                  ))}
                </div>
              )
            ) : videoTracks.length === 0 ? (
              <div className="py-16 text-center">
                <Video className="mx-auto mb-4 h-10 w-10 text-[#E8E6F0]" />
                <p className="font-body text-[#8A8A90]">
                  {query ? `No videos found for "${query}"` : 'No videos available.'}
                </p>
              </div>
            ) : (
              <div className="space-y-10">
                {groupedVideo.map(([albumName, albumTracks]) => (
                  <AlbumVideoSection
                    key={albumName}
                    albumName={albumName}
                    tracks={albumTracks}
                    onPlay={setActiveVideo}
                  />
                ))}
              </div>
            )}
          </div>
        </FadeIn>
      </SectionWrapper>
    </main>
  );
}
