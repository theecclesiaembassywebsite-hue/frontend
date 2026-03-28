"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import AudioPlayer from "@/components/media/AudioPlayer";
import Button from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { Search, Download } from "lucide-react";
import { media } from "@/lib/api";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

const topicOptions = [
  { value: "", label: "All Topics" },
];

const seriesOptions = [
  { value: "", label: "All Series" },
];

export default function AudioArchivePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSeries, setSelectedSeries] = useState("");
  const [activeSermon, setActiveSermon] = useState<string | null>(null);
  const [sermons, setSermons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await media.getAudioSermons(100, 0);
        setSermons(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch sermons");
        setSermons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSermons();
  }, []);

  const filtered = sermons.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.speaker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = !selectedTopic || s.topic === selectedTopic;
    const matchesSeries = !selectedSeries || s.series === selectedSeries;
    return matchesSearch && matchesTopic && matchesSeries;
  });

  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            Audio Archive
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            Listen to teachings from The Ecclesia Embassy
          </h6>
        </div>
      </section>

      {/* Search & Filters */}
      <SectionWrapper variant="off-white" className="!py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1 relative">
            <Input
              id="search"
              placeholder="Search by title or speaker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-text pointer-events-none"
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              id="topic"
              options={topicOptions}
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              id="series"
              options={seriesOptions}
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
            />
          </div>
        </div>
      </SectionWrapper>

      {/* Sermon List */}
      <SectionWrapper variant="white" className="!pt-4">
        {loading ? (
          <>
            <p className="text-body-small mb-4 h-5 w-32 bg-gray-border rounded animate-pulse"></p>
            <SkeletonGroup count={4} variant="table-row" />
          </>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="font-body text-base text-error">{error}</p>
          </div>
        ) : (
          <>
            <p className="text-body-small mb-4">
              {filtered.length} message{filtered.length !== 1 ? "s" : ""} found
            </p>
            <div className="flex flex-col gap-4">
              {filtered.map((sermon) => (
                <div
                  key={sermon.id}
                  className="rounded-[8px] border border-gray-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading text-lg font-semibold text-slate">
                        {sermon.title}
                      </h3>
                      <p className="text-body-small mt-0.5">
                        {sermon.speaker} &bull; {new Date(sermon.createdAt || sermon.date).toLocaleDateString()}
                      </p>
                      <div className="mt-1 flex gap-2">
                        <span className="inline-block rounded-full bg-purple-light px-2.5 py-0.5 text-[11px] font-heading font-semibold text-purple">
                          {sermon.series || "Series"}
                        </span>
                        <span className="inline-block rounded-full bg-off-white px-2.5 py-0.5 text-[11px] font-heading font-semibold text-gray-text">
                          {sermon.topic || "Topic"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="primary"
                        className="text-xs py-2 px-4 min-w-0"
                        onClick={() =>
                          setActiveSermon(activeSermon === sermon.id ? null : sermon.id)
                        }
                      >
                        {activeSermon === sermon.id ? "Close" : "Play"}
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-xs py-2 px-2 min-w-0"
                        title="Download (members only)"
                      >
                        <Download size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Inline player */}
                  {activeSermon === sermon.id && (
                    <div className="mt-4">
                      <AudioPlayer
                        src={sermon.audioUrl}
                        title={sermon.title}
                        speaker={sermon.speaker}
                      />
                    </div>
                  )}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="py-12 text-center">
                  <p className="font-body text-base text-gray-text">
                    No sermons found matching your search criteria.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </SectionWrapper>
    </>
  );
}
