"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { announcements as announcementsAPI } from "@/lib/api";
import { SkeletonGroup } from "@/components/ui/Skeleton";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await announcementsAPI.getAnnouncements();
        // Default to empty array if API returns null
        setAnnouncements(data?.slice(0, 3) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch announcements");
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);
  return (
    <SectionWrapper variant="lavender" id="announcements">
      <div className="text-center mb-10">
        <h2 className="font-heading text-[28px] font-bold text-slate leading-9">
          News & Announcements
        </h2>
        <p className="mt-2 font-serif text-lg italic text-gray-text">
          Stay informed on what&apos;s happening
        </p>
      </div>

      {loading ? (
        <SkeletonGroup count={3} variant="card" className="grid grid-cols-1 gap-6 md:grid-cols-3 space-y-0" />
      ) : error ? (
        <div className="text-center">
          <p className="font-body text-base text-error">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {announcements.map((item) => (
            <Link
              key={item.id}
              href={`/announcements/${item.id}` || "#"}
              className="group flex flex-col rounded-[8px] bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <span className="text-body-small font-semibold text-purple-vivid">
                {item.date || new Date(item.createdAt).toLocaleDateString()}
              </span>
              <h3 className="mt-2 font-heading text-lg font-bold text-slate">
                {item.title}
              </h3>
              <p className="mt-2 font-body text-sm text-gray-text leading-relaxed line-clamp-3">
                {item.excerpt || item.content?.substring(0, 150) || item.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-button text-purple-vivid group-hover:underline">
                Read More <ChevronRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
