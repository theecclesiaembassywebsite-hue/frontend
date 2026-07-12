"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, User, MapPin, Clock, Send, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { cith } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

function HubDashboardContent() {
  const [hubData, setHubData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [sent, setSent] = useState(false);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const { success, error: showError } = useToast();

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

    const fetchJoinRequests = async () => {
      try {
        const requests = await cith.getMyHubJoinRequests();
        setJoinRequests(requests || []);
      } catch {
        setJoinRequests([]);
      }
    };

    fetchHub();
    fetchJoinRequests();
  }, []);

  const handleReviewRequest = async (id: string, approved: boolean) => {
    setReviewingId(id);
    try {
      await cith.reviewMyHubJoinRequest(id, approved);
      setJoinRequests((prev) => prev.filter((r) => r.id !== id));
      success(approved ? "Request approved" : "Request rejected");
      if (approved) {
        const data = await cith.getMyHub();
        setHubData(data);
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to update request");
    } finally {
      setReviewingId(null);
    }
  };

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

          {/* Pending Join Requests */}
          <div className="rounded-[8px] border border-gray-border bg-white p-5 shadow-sm">
            <h3 className="font-heading text-base font-bold text-slate mb-3">
              Pending Join Requests{joinRequests.length > 0 ? ` (${joinRequests.length})` : ""}
            </h3>
            <div className="space-y-2">
              {joinRequests.length > 0 ? (
                joinRequests.map((r: any) => {
                  const name = [r.user?.profile?.firstName, r.user?.profile?.lastName].filter(Boolean).join(" ");
                  return (
                    <div key={r.id} className="rounded-[4px] bg-off-white px-3 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-light shrink-0">
                          <User className="h-3.5 w-3.5 text-purple/50" />
                        </div>
                        <span className="font-body text-sm text-slate truncate">
                          {name || r.user?.email || "Member"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          className="text-[11px] py-1.5 px-3 min-w-0 flex-1"
                          disabled={reviewingId === r.id}
                          onClick={() => handleReviewRequest(r.id, true)}
                        >
                          <CheckCircle size={12} className="mr-1" /> Approve
                        </Button>
                        <Button
                          variant="secondary"
                          className="text-[11px] py-1.5 px-3 min-w-0 flex-1 border text-error border-error hover:bg-error/10"
                          disabled={reviewingId === r.id}
                          onClick={() => handleReviewRequest(r.id, false)}
                        >
                          <XCircle size={12} className="mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="font-body text-xs text-gray-text">No pending requests.</p>
              )}
            </div>
          </div>

          {/* Meeting Points — visible because the leader/member is already approved */}
          {hubData.meetingPoints && hubData.meetingPoints.length > 0 && (
            <div className="rounded-[8px] border border-gray-border bg-white p-5 shadow-sm">
              <h3 className="font-heading text-base font-bold text-slate mb-3">Meeting Points</h3>
              <div className="space-y-2">
                {hubData.meetingPoints.map((mp: any) => (
                  <div key={mp.id} className="rounded-[4px] bg-off-white px-3 py-2">
                    <p className="font-body text-sm font-semibold text-slate">{mp.homeGiverName}</p>
                    <p className="font-body text-xs text-gray-text">{mp.address}</p>
                    <p className="font-body text-xs text-slate mt-1">Servant: {mp.churchServantName}</p>
                    {mp.assistantChurchServantName && (
                      <p className="font-body text-xs text-slate">Assistant: {mp.assistantChurchServantName}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
