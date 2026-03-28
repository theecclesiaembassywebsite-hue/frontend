"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { prayer } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import type { Prayer } from "@/lib/api";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-warning/10", text: "text-warning", label: "Pending" },
  approved: { bg: "bg-info/10", text: "text-info", label: "Being Prayed For" },
  rejected: { bg: "bg-error/10", text: "text-error", label: "Received" },
  RECEIVED: { bg: "bg-warning/10", text: "text-warning", label: "Received" },
  BEING_PRAYED_FOR: { bg: "bg-info/10", text: "text-info", label: "Being Prayed For" },
  ANSWERED: { bg: "bg-success/10", text: "text-success", label: "Answered" },
};

function PrayerTrackingContent() {
  const [requests, setRequests] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrayers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await prayer.getMyPrayers();
        setRequests(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch prayer requests");
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayers();
  }, []);

  if (loading) {
    return (
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-5 w-5 rounded bg-gray-border animate-pulse" />
            <div className="h-8 w-48 rounded bg-gray-border animate-pulse" />
          </div>
          <SkeletonGroup count={4} variant="card" className="space-y-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-off-white min-h-screen">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-gray-text hover:text-purple transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-heading text-2xl font-bold text-slate">
            My Prayer Requests
          </h1>
        </div>

        {error ? (
          <div className="rounded-[8px] border border-error/30 bg-error/10 p-4 text-center">
            <p className="font-body text-sm text-error">{error}</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-[8px] border border-gray-border bg-white p-12 text-center shadow-sm">
            <p className="font-body text-base text-gray-text">No prayer requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((r) => {
              const status = statusColors[r.status] || statusColors.pending;
              return (
                <div
                  key={r.id}
                  className="rounded-[8px] border border-gray-border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading text-base font-bold text-slate mb-1">
                        {r.title}
                      </h3>
                      <p className="font-body text-sm text-slate leading-relaxed">
                        {r.description}
                      </p>
                      <p className="mt-2 font-body text-xs text-gray-text">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-block rounded-full px-3 py-1 text-[11px] font-heading font-semibold ${status.bg} ${status.text}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PrayerTrackingPage() {
  return (
    <ProtectedRoute>
      <PrayerTrackingContent />
    </ProtectedRoute>
  );
}
