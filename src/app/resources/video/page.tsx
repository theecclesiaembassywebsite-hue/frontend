"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Select from "@/components/ui/Select";
import { useState, useEffect } from "react";
import { media } from "@/lib/api";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

function extractYoutubeId(url?: string): string {
  if (!url) return "dQw4w9WgXcQ";
  const match = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([^&\n?#]+)/);
  return match?.[1] || "dQw4w9WgXcQ";
}

const seriesOptions = [
  { value: "", label: "All Series" },
];

export default function VideoMessagesPage() {
  const [selectedSeries, setSelectedSeries] = useState("");
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await media.getVideoMessages(100, 0);
        setVideos(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch videos");
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const filtered = videos.filter(
    (v) => !selectedSeries || v.series === selectedSeries,
  );

  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            Video Messages
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            Watch teachings from The Ecclesia Embassy
          </h6>
        </div>
      </section>

      {/* Filter */}
      <SectionWrapper variant="off-white" className="!py-6">
        <div className="flex items-end gap-4 max-w-xs">
          <Select
            id="series"
            label="Filter by Series"
            options={seriesOptions}
            value={selectedSeries}
            onChange={(e) => setSelectedSeries(e.target.value)}
          />
        </div>
      </SectionWrapper>

      {/* Video Grid */}
      <SectionWrapper variant="white" className="!pt-4">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[8px] border border-gray-border bg-white"
              >
                <Skeleton variant="card" className="h-40 rounded-b-none" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="font-body text-base text-error">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-body text-base text-gray-text">
              No videos found matching your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((video) => (
              <div
                key={video.id}
                className="overflow-hidden rounded-[8px] border border-gray-border bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* 16:9 YouTube embed */}
                <div className="relative aspect-video bg-near-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId || video.videoUrl?.includes("youtube") ? extractYoutubeId(video.videoUrl) : "dQw4w9WgXcQ"}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-heading text-base font-semibold text-slate line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-body-small mt-1">
                    {new Date(video.createdAt || video.date).toLocaleDateString()}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-purple-light px-2.5 py-0.5 text-[11px] font-heading font-semibold text-purple">
                    {video.series || "Series"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionWrapper>
    </>
  );
}
