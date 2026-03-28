"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { media } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";

export default function LatestMessage() {
  const [sermon, setSermon] = useState<any>(null);
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
        setError(err instanceof Error ? err.message : "Failed to fetch latest sermon");
        setSermon(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  const youtubeVideoId = sermon?.youtubeId || sermon?.videoUrl?.match(/(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([^&\n?#]+)/)?.[1] || "dQw4w9WgXcQ";

  return (
    <SectionWrapper variant="white" id="latest-message">
      <div className="text-center mb-10">
        <h2 className="font-heading text-[28px] font-bold text-slate leading-9">
          Latest Message
        </h2>
        <p className="mt-2 font-serif text-lg italic text-gray-text">
          Watch the most recent teaching
        </p>
      </div>

      {/* Responsive 16:9 YouTube embed */}
      <div className="mx-auto max-w-3xl">
        {loading ? (
          <Skeleton variant="card" className="aspect-video rounded-[8px]" />
        ) : error ? (
          <div className="aspect-video bg-gray-border rounded-[8px] flex items-center justify-center">
            <p className="font-body text-sm text-error">{error}</p>
          </div>
        ) : (
          <div className="relative aspect-video w-full overflow-hidden rounded-[8px] bg-near-black shadow-md">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeVideoId}`}
              title={sermon?.title || "Latest sermon from The Ecclesia Embassy"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/resources/video">
            <Button variant="primary">View Full Sermon Archive</Button>
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}
