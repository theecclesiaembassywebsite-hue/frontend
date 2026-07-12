"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Users, Calendar, Clock, UserCheck, Loader2 } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Button from "@/components/ui/Button";
import { cith } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { FadeIn } from "@/components/ui/Motion";
import { SkeletonGroup } from "@/components/ui/Skeleton";

interface HubDetail {
  id: string;
  name: string;
  leader?: { id: string; email: string; profile?: { firstName?: string; lastName?: string; photoUrl?: string } } | string;
  location?: string;
  area?: string;
  city?: string;
  state?: string;
  address?: string;
  meetingDay?: string;
  meetingTime?: string;
  capacity?: number;
  description?: string;
  _count?: { members: number };
  members?: Array<{ id: string; user?: { profile?: { firstName?: string; lastName?: string } } }>;
  isMember?: boolean;
  isLeader?: boolean;
  myJoinRequestStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
  meetingPoints?: Array<{
    id: string;
    homeGiverName: string;
    address: string;
    churchServantName: string;
    assistantChurchServantName?: string | null;
  }>;
}

function getLeaderName(hub: HubDetail): string {
  if (!hub.leader) return "Unassigned";
  if (typeof hub.leader === "string") return hub.leader;
  const profile = hub.leader.profile;
  return [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "Unassigned";
}

function getHubLocation(hub: HubDetail): string {
  if (hub.location) return hub.location;
  return [hub.area, hub.city, hub.state].filter(Boolean).join(", ") || "Location TBD";
}

function getMemberCount(hub: HubDetail): number {
  if (hub._count?.members !== undefined) return hub._count.members;
  if (hub.members) return hub.members.length;
  return 0;
}

function HubDetailContent({ hubId }: { hubId: string }) {
  const [hub, setHub] = useState<HubDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [justRequested, setJustRequested] = useState(false);
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();

  useEffect(() => {
    cith.getHub(hubId)
      .then((data) => {
        if (!data) {
          setNotFound(true);
        } else {
          setHub(data);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [hubId]);

  const handleRequestJoin = async () => {
    if (!isAuthenticated) {
      error("Please sign in to request to join a hub.");
      return;
    }
    setRequesting(true);
    try {
      await cith.joinHub(hubId);
      setJustRequested(true);
      success("Your request to join has been submitted and is pending approval.");
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to submit request. Please try again.");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white">
        <div className="mx-auto max-w-[800px] px-4 py-8 sm:px-6 md:px-8">
          <SkeletonGroup count={3} variant="card" />
        </div>
      </div>
    );
  }

  if (notFound || !hub) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center px-4">
        <div className="rounded-[8px] border border-gray-border bg-white p-10 text-center max-w-md shadow-sm">
          <MapPin className="mx-auto h-12 w-12 text-[#E4E0EF] mb-4" />
          <h1 className="font-heading text-xl font-bold text-[#241A42] mb-2">Hub Not Found</h1>
          <p className="font-body text-sm text-[#8A8A8E] mb-6">
            This hub may have been removed or the link is incorrect.
          </p>
          <Link href="/cith">
            <Button variant="primary">Browse All Hubs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const leaderName = getLeaderName(hub);
  const location = getHubLocation(hub);
  const memberCount = getMemberCount(hub);

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative flex items-center justify-center py-24 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-[#241A42] to-[#4A1D6E]" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <MapPin className="mx-auto h-10 w-10 text-[#E4E0EF] mb-3" />
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">{hub.name}</h1>
          <p className="mt-2 font-body text-[#E4E0EF]">{location}</p>
        </div>
      </section>

      <SectionWrapper variant="white">
        <FadeIn>
          <div className="mx-auto max-w-[700px]">
            <Link href="/cith" className="flex items-center gap-2 text-[#771996] hover:underline mb-8 font-body text-sm">
              <ArrowLeft size={16} /> Back to All Hubs
            </Link>

            {/* Hub Details Card */}
            <div className="rounded-[8px] border border-[#E4E0EF] bg-white p-6 shadow-sm mb-6">
              <h2 className="font-heading text-lg font-bold text-[#241A42] mb-4">Hub Details</h2>
              <div className="space-y-3 text-sm font-body">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-[#8A8A8E]">
                    <UserCheck size={14} /> Leader
                  </span>
                  <span className="font-semibold text-[#241A42]">{leaderName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-[#8A8A8E]">
                    <MapPin size={14} /> Location
                  </span>
                  <span className="text-[#241A42]">{location}</span>
                </div>
                {hub.address && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-[#8A8A8E]">
                      <MapPin size={14} /> Address
                    </span>
                    <span className="text-[#241A42]">{hub.address}</span>
                  </div>
                )}
                {hub.meetingDay && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-[#8A8A8E]">
                      <Calendar size={14} /> Meeting Day
                    </span>
                    <span className="text-[#241A42]">{hub.meetingDay}</span>
                  </div>
                )}
                {hub.meetingTime && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-[#8A8A8E]">
                      <Clock size={14} /> Meeting Time
                    </span>
                    <span className="text-[#241A42]">{hub.meetingTime}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-[#8A8A8E]">
                    <Users size={14} /> Members
                  </span>
                  <span className="font-semibold text-[#241A42]">
                    {memberCount}{hub.capacity ? ` / ${hub.capacity}` : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Meeting Points — only present once the backend has confirmed membership/leadership */}
            {hub.meetingPoints && hub.meetingPoints.length > 0 && (
              <div className="rounded-[8px] border border-[#E4E0EF] bg-white p-6 shadow-sm mb-6">
                <h2 className="font-heading text-lg font-bold text-[#241A42] mb-4">Meeting Points</h2>
                <div className="space-y-4">
                  {hub.meetingPoints.map((mp) => (
                    <div key={mp.id} className="rounded-[6px] bg-[#F5F5F5] p-4 text-sm font-body">
                      <p className="font-heading font-semibold text-[#241A42]">{mp.homeGiverName}</p>
                      <p className="text-[#8A8A8E]">{mp.address}</p>
                      <p className="text-[#31333B] mt-1">Servant: {mp.churchServantName}</p>
                      {mp.assistantChurchServantName && (
                        <p className="text-[#31333B]">Assistant: {mp.assistantChurchServantName}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {hub.description && (
              <div className="rounded-[8px] border border-[#E4E0EF] bg-white p-6 shadow-sm mb-6">
                <h2 className="font-heading text-lg font-bold text-[#241A42] mb-2">About This Hub</h2>
                <p className="font-body text-sm text-[#31333B] leading-relaxed">{hub.description}</p>
              </div>
            )}

            {/* Join Button */}
            <div className="rounded-[8px] border border-[#E4E0EF] bg-[#F5F5F5] p-6 text-center">
              {hub.isMember || hub.isLeader ? (
                <div>
                  <UserCheck className="mx-auto h-10 w-10 text-[#27AE60] mb-3" />
                  <h3 className="font-heading text-lg font-bold text-[#241A42] mb-1">
                    {hub.isLeader ? "You Lead This Hub" : "Welcome to the Hub!"}
                  </h3>
                  <p className="font-body text-sm text-[#8A8A8E]">
                    You are now part of this Church in the House family.
                  </p>
                </div>
              ) : justRequested || hub.myJoinRequestStatus === "PENDING" ? (
                <div>
                  <Loader2 className="mx-auto h-10 w-10 text-[#C9A84C] mb-3" />
                  <h3 className="font-heading text-lg font-bold text-[#241A42] mb-1">Request Pending</h3>
                  <p className="font-body text-sm text-[#8A8A8E]">
                    Your request to join has been sent to the hub leader for approval.
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#241A42] mb-2">Request to Join This Hub</h3>
                  <p className="font-body text-sm text-[#8A8A8E] mb-4">
                    {hub.myJoinRequestStatus === "REJECTED"
                      ? "Your previous request wasn't approved. You're welcome to submit a new request."
                      : "Be part of a loving community that meets regularly for fellowship and growth. Your request will be reviewed by the hub leader before you're added."}
                  </p>
                  {isAuthenticated ? (
                    <Button
                      variant="primary"
                      onClick={handleRequestJoin}
                      disabled={requesting}
                      className="inline-flex items-center gap-2"
                    >
                      {requesting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          <Users size={16} /> Request to Join
                        </>
                      )}
                    </Button>
                  ) : (
                    <div>
                      <p className="font-body text-sm text-[#8A8A8E] mb-3">
                        Please sign in to request to join this hub.
                      </p>
                      <Link href="/auth/login">
                        <Button variant="primary">Sign In</Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </FadeIn>
      </SectionWrapper>
    </main>
  );
}

export default function HubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <HubDetailContent hubId={id} />;
}
