"use client";

import { useState, useEffect } from "react";
import { Play } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { media } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { FadeIn, ScaleIn } from "@/components/ui/Motion";

interface Sermon {
  id: string;
  title?: string;
  youtubeId?: string;
  videoUrl?: string;
  description?: string;
}

export default function LatestMessage() {
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await media.getLatestSermon();
        setSermon(data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load latest sermon");
        setSermon(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  const extractYoutubeId = (sermon: Sermon | null): string => {
    if (!sermon) return "";

    if (sermon.youtubeId) return sermon.youtubeId;

    if (sermon.videoUrl) {
      const match = sermon.videoUrl.match(
        /(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([^&\n?#]+)/
      );
      if (match?.[1]) return match[1];
    }

    return "";
  };

  const youtubeVideoId = extractYoutubeId(sermon);

  return (
    <SectionWrapper variant="white" id="latest-message">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn>
          <div className="mb-12">
            <h2 className="font-heading text-4xl font-bold text-slate">
              Latest Message
            </h2>
            <p className="mt-2 text-lg text-gray-text">
              Watch the most recent teaching
            </p>
          </div>
        </FadeIn>

        {/* Video Container */}
        <div className="mx-auto max-w-3xl">
          {loading ? (
            <Skeleton variant="card" className="aspect-video rounded-xl" />
          ) : error ? (
            <div className="flex aspect-video items-center justify-center rounded-xl border-2 border-purple-vivid bg-purple-50 px-6 py-12 text-center">
              <div>
                <p className="font-heading text-slate">Unable to load sermon</p>
                <p className="mt-2 font-body text-gray-text">{error}</p>
                <Link href="/resources/video" className="mt-4 inline-block">
                  <Button variant="primary">Browse Sermon Archive</Button>
                </Link>
              </div>
            </div>
          ) : youtubeVideoId ? (
            <ScaleIn>
              <div className="overflow-hidden rounded-xl shadow-lg">
                <div className="relative aspect-video w-full bg-slate">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                    title={sermon?.title || "Latest sermon from The Ecclesia Embassy"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </div>
            </ScaleIn>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-xl bg-purple-50 px-6">
              <div className="text-center">
                <Play className="mx-auto h-16 w-16 text-purple-vivid opacity-50" />
                <p className="mt-4 font-heading text-slate">No sermon available</p>
                <p className="mt-2 font-body text-gray-text">Check back soon for the latest message</p>
              </div>
            </div>
          )}

          {/* Sermon Title and Archive Link */}
          {!loading && !error && sermon?.title && (
            <FadeIn delay={0.3}>
              <div className="mt-8">
                <h3 className="font-heading text-lg text-slate">
                  {sermon.title}
                </h3>
              </div>
            </FadeIn>
          )}

          <div className="mt-8 text-center">
            <Link href="/resources/video">
              <Button variant="primary">View Full Sermon Archive</Button>
            </Link>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
