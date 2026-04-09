"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, User, MapPin, Clock, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { cith } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

function HubDashboardContent() {
  const [hubData, setHubData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const fetchHub = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await cith.getMyHub();
        // Handle null/empty responses — user has no hub
        if (!data) {
          setHubData(null);
        } else {
          setHubData(data);
        }
      } catch (err) {
        // Don't show technical errors for "no hub" case
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("JSON") || msg.includes("Unexpected")) {
          // Backend returned empty/null — user simply has no hub
          setHubData(null);
        } else {
          setError(msg || "Failed to fetch hub data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHub();
  }, []);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!announcement.trim()) return;
    // TODO: wire to backend when hub announcement endpoint exists
    setSent(true);
    setAnnouncement("");
    setTimeout(() => setSent(false), 3000);
  }

  if (loading) {
    return (
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-8 w-48" />
          </div>
          <SkeletonGroup count={3} variant="card" />
        </div>
      </div>
    );
  }

  if (error || !hubData) {
    return (
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/dashboard" className="text-gray-text hover:text-purple transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-heading text-2xl font-bold text-slate">My Hub</h1>
          </div>
          <div className="rounded-[8px] border border-gray-border bg-white p-12 text-center shadow-sm">
            <p className="font-body text-base text-gray-text">
              {error || "You have not been assigned to a hub yet. Visit CITH to join or create one."}
            </p>
            <Link href="/cith" className="mt-4 inline-block text-purple-vivid hover:underline">
              Explore CITH
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const location = [hubData.area, hubData.city, hubData.state].filter(Boolean).join(", ");

  return (
    <div className="bg-off-white min-h-screen">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-gray-text hover:text-purple transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-heading text-2xl font-bold text-slate">My Hub</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Hub Info */}
          <div className="rounded-[8px] border border-gray-border bg-white p-5 shadow-sm">
            <h3 className="font-heading text-lg font-bold text-slate mb-4">
              {hubData.name}
            </h3>
            <div className="space-y-2 text-sm font-body text-gray-text">
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} /> {location}
                </div>
              )}
              {hubData.meetingDay && (
                <div className="flex items-center gap-2">
                  <Clock size={14} /> {hubData.meetingDay}
                  {hubData.meetingTime && ` at ${hubData.meetingTime}`}
                </div>
              )}
              <div className="flex items-center gap-2">
                <User size={14} /> {hubData.members?.length || 0} members
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="rounded-[8px] border border-gray-border bg-white p-5 shadow-sm">
            <h3 className="font-heading text-base font-bold text-slate mb-3">Members</h3>
            <div className="space-y-2">
              {hubData.members && hubData.members.length > 0 ? (
                hubData.members.map((m: any) => {
                  const name = [m.user?.profile?.firstName, m.user?.profile?.lastName].filter(Boolean).join(" ");
                  return (
                    <div key={m.id} className="flex items-center justify-between rounded-[4px] bg-off-white px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-light">
                          <User className="h-3.5 w-3.5 text-purple/50" />
                        </div>
                        <span className="font-body text-sm text-slate truncate">
                          {name || m.user?.email || "Member"}
                        </span>
                      </div>
                      {m.joinedAt && (
                        <span className="text-[10px] text-gray-text shrink-0">
                          {new Date(m.joinedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="font-body text-xs text-gray-text">No members yet.</p>
              )}
            </div>
          </div>

          {/* Send Announcement */}
          <div className="rounded-[8px] border border-gray-border bg-white p-5 shadow-sm">
            <h3 className="font-heading text-base font-bold text-slate mb-3">Send Announcement</h3>
            <form onSubmit={handleSend} className="flex flex-col gap-3">
              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Type your announcement to hub members..."
                rows={4}
                className="w-full rounded-[4px] border border-gray-border bg-off-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:outline-none resize-y"
              />
              <Button type="submit" variant="primary" className="text-xs py-2 min-w-0">
                <Send size={14} className="mr-1" /> Send to Members
              </Button>
              {sent && (
                <p className="text-xs font-heading font-semibold text-success">Announcement sent!</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HubDashboardPage() {
  return (
    <ProtectedRoute>
      <HubDashboardContent />
    </ProtectedRoute>
  );
}
