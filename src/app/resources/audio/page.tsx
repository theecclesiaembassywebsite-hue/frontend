'use client';

import { useState, useEffect, useRef } from 'react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { media } from '@/lib/api';
import { SkeletonGroup } from '@/components/ui/Skeleton';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/Motion';
import { Search, Play, Pause, Clock, Calendar, ExternalLink, X } from 'lucide-react';

interface SpotifyEpisode {
  id: string;
  name: string;
  description: string;
  releaseDate: string;
  duration: string;
  image: string | null;
  audioUrl: string | null;
  spotifyUrl: string;
}

function EpisodePlayer({ episode, onClose }: { episode: SpotifyEpisode; onClose: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setTotalDuration(audio.duration);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.play().catch(() => {});
    return () => {
      audio.pause();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [episode.id]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    playing ? audio.pause() : audio.play();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !totalDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * totalDuration;
  };

  const fmt = (s: number) => {
    if (isNaN(s) || s < 0) return "0:00";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      : `${m}:${String(sec).padStart(2, "0")}`;
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  const SPOTIFY_ICON = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-[#0E0B1E]/96 backdrop-blur-xl shadow-[0_-8px_40px_rgba(0,0,0,0.5)]">
      <audio ref={audioRef} src={episode.audioUrl!} preload="metadata" />
      <div className="mx-auto max-w-4xl px-4 py-3 flex items-center gap-4">
        {/* Thumbnail */}
        {episode.image ? (
          <img src={episode.image} alt={episode.name} className="h-12 w-12 shrink-0 rounded-[8px] object-cover" />
        ) : (
          <div className="h-12 w-12 shrink-0 rounded-[8px] bg-[#1DB954]/15 flex items-center justify-center">
            <span className="h-5 w-5 text-[#1DB954]">{SPOTIFY_ICON}</span>
          </div>
        )}

        {/* Title (hidden on small screens) */}
        <div className="min-w-0 w-44 shrink-0 hidden sm:block">
          <p className="line-clamp-1 font-heading text-sm font-bold text-white">{episode.name}</p>
          <p className="mt-0.5 font-body text-[11px] text-white/40 truncate">{episode.duration}</p>
        </div>

        {/* Controls */}
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <button
            onClick={togglePlay}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1DB954] hover:bg-[#17a349] transition-colors"
          >
            {playing
              ? <Pause className="h-4 w-4 text-black" />
              : <Play className="h-4 w-4 text-black ml-0.5" />}
          </button>
          <div className="flex w-full items-center gap-2">
            <span className="font-body text-[10px] text-white/40 w-9 text-right tabular-nums">
              {fmt(currentTime)}
            </span>
            <div
              className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer group"
              onClick={seek}
            >
              <div
                className="h-full bg-[#1DB954] rounded-full transition-all duration-100 group-hover:bg-[#1ed760]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-body text-[10px] text-white/40 w-9 tabular-nums">
              {fmt(totalDuration)}
            </span>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="shrink-0 rounded-full p-1.5 hover:bg-white/10 transition-colors"
          aria-label="Close player"
        >
          <X className="h-4 w-4 text-white/50" />
        </button>
      </div>
    </div>
  );
}

export default function AudioArchivePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [audioMessages, setAudioMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAudio, setActiveAudio] = useState<string | null>(null);
  const [activePodcast, setActivePodcast] = useState(0);
  const [recentEpisodes, setRecentEpisodes] = useState<SpotifyEpisode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState<SpotifyEpisode | null>(null);

  const podcasts = [
    { name: "The Ecclesia Embassy Podcast", showId: "38f94eSitKoPzXLUunJRV4", url: "https://open.spotify.com/show/38f94eSitKoPzXLUunJRV4", desc: "Deep teachings, revelations, and messages from The Ecclesia Embassy." },
    { name: "The Victor Oluwadamilare Podcast", showId: "1hiBj66Ggd8GvfQVV9aQRC", url: "https://open.spotify.com/show/1hiBj66Ggd8GvfQVV9aQRC", desc: "Prophetic insights and kingdom wisdom from Pastor Victor Oluwadamilare." },
  ];

  useEffect(() => {
    const showId = podcasts[activePodcast]?.showId;
    if (!showId) return;
    setEpisodesLoading(true);
    setRecentEpisodes([]);
    fetch(`/api/spotify-episodes?showId=${showId}`)
      .then((r) => r.json())
      .then((data: { episodes?: SpotifyEpisode[] }) => setRecentEpisodes(data.episodes ?? []))
      .catch(() => setRecentEpisodes([]))
      .finally(() => setEpisodesLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePodcast]);

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await media.getAudioSermons();
        setAudioMessages(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch audio messages');
        setAudioMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAudio();
  }, []);

  const sortedMessages = [...audioMessages].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date || 0).getTime();
    const dateB = new Date(b.createdAt || b.date || 0).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const filtered = sortedMessages.filter((msg) => {
    const matchesSearch =
      !searchQuery ||
      msg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.speaker?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className={activeEpisode ? "pb-24" : ""}>
      {/* Hero Section */}
      <section
        className="relative h-96 flex items-center justify-center text-center text-white overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-4">
          <FadeIn>
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4">
              Audio Archive
            </h1>
            <p className="font-body text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
              Listen to past messages and teachings
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Spotify Podcasts */}
      <SectionWrapper variant="dark-purple" className="py-14">
        {(() => {
          const SPOTIFY_ICON = (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          );

          const active = podcasts[activePodcast];

          return (
            <div className="mx-auto max-w-4xl">
              {/* Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#1DB954]/30 bg-[#1DB954]/10 px-4 py-1.5 mb-4">
                  <span className="h-4 w-4 text-[#1DB954]">{SPOTIFY_ICON}</span>
                  <span className="font-heading text-[11px] font-semibold uppercase tracking-[2px] text-[#1DB954]">
                    Now on Spotify
                  </span>
                </div>
                <h2 className="font-heading text-[28px] font-bold text-white md:text-[34px]">
                  Listen to Our Podcasts
                </h2>
                <p className="mt-2 font-body text-sm leading-7 text-white/55">
                  Spirit-filled conversations and teachings — play episodes right here.
                </p>
              </div>

              {/* Podcast selector tabs */}
              <div className="grid gap-3 md:grid-cols-2 mb-6">
                {podcasts.map((podcast, i) => (
                  <button
                    key={podcast.showId}
                    onClick={() => setActivePodcast(i)}
                    className={`flex items-center gap-4 rounded-[20px] border p-5 text-left transition-all duration-200 ${
                      activePodcast === i
                        ? "border-[#1DB954]/50 bg-[#1DB954]/10 shadow-lg shadow-[#1DB954]/10"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl p-2.5 transition-colors ${
                        activePodcast === i ? "bg-[#1DB954]" : "bg-[#1DB954]/15 ring-1 ring-[#1DB954]/25"
                      }`}
                    >
                      <span className={activePodcast === i ? "text-white" : "text-[#1DB954]"}>
                        {SPOTIFY_ICON}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-sm font-bold text-white leading-snug">
                        {podcast.name}
                      </p>
                      <p className="mt-0.5 font-body text-xs leading-5 text-white/50 line-clamp-1">
                        {podcast.desc}
                      </p>
                    </div>
                    {activePodcast === i && (
                      <span className="shrink-0 h-2 w-2 rounded-full bg-[#1DB954] shadow-[0_0_6px_#1DB954]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Embedded player */}
              <div className="rounded-[24px] overflow-hidden border border-white/10 shadow-2xl">
                <iframe
                  key={active.showId}
                  src={`https://open.spotify.com/embed/show/${active.showId}?utm_source=generator&theme=0`}
                  width="100%"
                  height="380"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title={active.name}
                  style={{ border: "none", display: "block" }}
                />
              </div>

              {/* Open in Spotify link */}
              <div className="mt-4 text-center">
                <a
                  href={active.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-body text-xs text-white/35 hover:text-[#1DB954] transition-colors"
                >
                  Open in Spotify
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              </div>

              {/* Recent episodes */}
              <div className="mt-10">
                <p className="mb-4 font-heading text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                  Recent Episodes
                </p>

                {episodesLoading ? (
                  <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-20 animate-pulse rounded-[16px] bg-white/6" />
                    ))}
                  </div>
                ) : recentEpisodes.length > 0 ? (
                  <div className="space-y-3">
                    {recentEpisodes.map((ep) => {
                      const isActive = activeEpisode?.id === ep.id;
                      return ep.audioUrl ? (
                        <button
                          key={ep.id}
                          onClick={() => setActiveEpisode(isActive ? null : ep)}
                          className={`group w-full flex items-center gap-4 rounded-[16px] border p-4 text-left transition-all duration-200 ${
                            isActive
                              ? "border-[#1DB954]/50 bg-[#1DB954]/10"
                              : "border-white/8 bg-white/5 hover:border-[#1DB954]/30 hover:bg-[#1DB954]/6"
                          }`}
                        >
                          <div className="relative shrink-0">
                            {ep.image ? (
                              <img src={ep.image} alt={ep.name} className="h-14 w-14 rounded-[10px] object-cover" />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-[10px] bg-[#1DB954]/15 text-[#1DB954]">
                                <span className="h-6 w-6">{SPOTIFY_ICON}</span>
                              </div>
                            )}
                            <div className={`absolute inset-0 flex items-center justify-center rounded-[10px] bg-black/40 transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                              {isActive
                                ? <Pause className="h-5 w-5 text-white drop-shadow" />
                                : <Play className="h-5 w-5 text-white drop-shadow ml-0.5" />}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`line-clamp-1 font-heading text-sm font-bold transition-colors ${isActive ? "text-[#1DB954]" : "text-white group-hover:text-[#1DB954]"}`}>
                              {ep.name}
                            </p>
                            <div className="mt-1 flex items-center gap-3 font-body text-xs text-white/40">
                              <span>{new Date(ep.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {ep.duration}
                              </span>
                            </div>
                          </div>
                          {isActive && (
                            <span className="shrink-0 h-2 w-2 rounded-full bg-[#1DB954] shadow-[0_0_6px_#1DB954] animate-pulse" />
                          )}
                        </button>
                      ) : (
                        <a
                          key={ep.id}
                          href={ep.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-4 rounded-[16px] border border-white/8 bg-white/5 p-4 transition-all duration-200 hover:border-[#1DB954]/30 hover:bg-[#1DB954]/6"
                        >
                          {ep.image ? (
                            <img src={ep.image} alt={ep.name} className="h-14 w-14 shrink-0 rounded-[10px] object-cover" />
                          ) : (
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] bg-[#1DB954]/15 text-[#1DB954]">
                              <span className="h-6 w-6">{SPOTIFY_ICON}</span>
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 font-heading text-sm font-bold text-white group-hover:text-[#1DB954] transition-colors">
                              {ep.name}
                            </p>
                            <div className="mt-1 flex items-center gap-3 font-body text-xs text-white/40">
                              <span>{new Date(ep.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {ep.duration}
                              </span>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 shrink-0 text-white/20 transition-colors group-hover:text-[#1DB954]" />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="font-body text-xs text-white/30">
                    Episodes unavailable — add <code className="text-white/50">SPOTIFY_CLIENT_ID</code> and <code className="text-white/50">SPOTIFY_CLIENT_SECRET</code> to your environment.
                  </p>
                )}
              </div>
            </div>
          );
        })()}
      </SectionWrapper>

      {/* Search & Sort Section */}
      <SectionWrapper variant="off-white" className="py-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-4 md:flex-row md:items-end md:gap-4">
          <div className="flex-1 relative">
            <Input
              placeholder="Search by title or speaker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-text pointer-events-none"
            />
          </div>
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            options={[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
            ]}
          />
        </div>
      </SectionWrapper>

      {/* Audio List Section */}
      <SectionWrapper variant="white" className="py-12">
        {loading ? (
          <SkeletonGroup count={5} variant="table-row" />
        ) : error ? (
          <div className="py-12 text-center">
            <p className="font-body text-base" style={{ color: '#8A8A90' }}>
              {error}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-body text-base" style={{ color: '#8A8A90' }}>
              No audio messages found matching your search.
            </p>
          </div>
        ) : (
          <StaggerContainer className="space-y-4">
            <p className="text-sm font-body mb-6" style={{ color: '#8A8A90' }}>
              {filtered.length} message{filtered.length !== 1 ? 's' : ''} found
            </p>
            {filtered.map((audio) => (
              <StaggerItem key={audio.id}>
                <div
                  className="p-6 rounded-lg border transition-all duration-300 hover:shadow-md"
                  style={{
                    backgroundColor: '#FAFAF8',
                    borderColor: '#E8E6F0',
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() =>
                            setActiveAudio(activeAudio === audio.id ? null : audio.id)
                          }
                          className="flex-shrink-0 p-3 rounded-full transition-colors"
                          style={{ backgroundColor: '#E8E6F0' }}
                        >
                          <Play
                            size={20}
                            style={{ color: '#C9A84C' }}
                            className="ml-0.5"
                          />
                        </button>
                        <div className="min-w-0 flex-1">
                          <h3
                            className="font-heading text-lg font-semibold mb-2 truncate"
                            style={{ color: '#0E0B1E' }}
                          >
                            {audio.title}
                          </h3>
                          <div className="flex flex-wrap gap-3 items-center text-sm">
                            <span style={{ color: '#8A8A90' }}>
                              {audio.speaker}
                            </span>
                            <div className="flex items-center gap-1" style={{ color: '#8A8A90' }}>
                              <Calendar size={14} />
                              {new Date(
                                audio.createdAt || audio.date || 0
                              ).toLocaleDateString()}
                            </div>
                            {audio.duration && (
                              <div className="flex items-center gap-1" style={{ color: '#8A8A90' }}>
                                <Clock size={14} />
                                {audio.duration}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inline Audio Player */}
                  {activeAudio === audio.id && audio.audioUrl && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E8E6F0' }}>
                      <audio
                        controls
                        src={audio.audioUrl}
                        className="w-full"
                        style={{ backgroundColor: '#FAFAF8' }}
                      />
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </SectionWrapper>

      {activeEpisode && (
        <EpisodePlayer episode={activeEpisode} onClose={() => setActiveEpisode(null)} />
      )}
    </div>
  );
}
