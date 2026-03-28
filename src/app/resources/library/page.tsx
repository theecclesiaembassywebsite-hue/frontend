"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Button from "@/components/ui/Button";
import { BookOpen, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { media } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";

export default function LibraryPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await media.getLibrary();
        setResources(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch library");
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, []);
  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            Ecclesia Library
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            Books, bulletins, and ministry materials
          </h6>
        </div>
      </section>

      {/* Resource Grid */}
      <SectionWrapper variant="white">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col rounded-[8px] border border-gray-border bg-white overflow-hidden"
              >
                <Skeleton variant="card" className="h-48 rounded-b-none" />
                <div className="p-4 space-y-3">
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
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {resources.map((res) => (
              <div
                key={res.id}
                className="flex flex-col rounded-[8px] border border-gray-border bg-white overflow-hidden shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Cover placeholder */}
                <div className="flex aspect-[3/4] items-center justify-center bg-purple-dark">
                  <BookOpen className="h-16 w-16 text-white/20" />
                </div>

                <div className="flex flex-col flex-1 p-4">
                  <h3 className="font-heading text-base font-semibold text-slate line-clamp-2">
                    {res.title}
                  </h3>
                  <p className="text-body-small mt-0.5">{res.author || "Author"}</p>
                  <span className="mt-2 inline-block self-start rounded-full bg-off-white px-2.5 py-0.5 text-[11px] font-heading font-semibold text-gray-text">
                    {res.category || res.type || "Resource"}
                  </span>

                  <div className="mt-auto pt-4">
                    {!res.price ? (
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-sm font-bold text-success">
                          Free
                        </span>
                        <Button variant="primary" className="text-xs py-2 px-3 min-w-0">
                          <Download size={14} className="mr-1" /> Download
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-sm font-bold text-slate">
                          &#8358;{(res.price || 0).toLocaleString()}
                        </span>
                        <Button variant="giving" className="text-xs py-2 px-3 min-w-0">
                          Purchase
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionWrapper>
    </>
  );
}
