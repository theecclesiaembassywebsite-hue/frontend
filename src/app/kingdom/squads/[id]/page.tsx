"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Calendar, Clock, Activity, Check } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Button from "@/components/ui/Button";
import { squads as squadsAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { SkeletonGroup } from "@/components/ui/Skeleton";

interface Squad {
  id: string;
  name: string;
  description?: string;
  leader?: {
    id: string;
    email: string;
    profile?: { firstName?: string; lastName?: string; photoUrl?: string; phone?: string; bio?: string };
  } | null;
  members?: Array<{ user: { profile?: { firstName?: string; lastName?: string } } }>;
  _count?: { members: number };
  meetingDay?: string;
  meetingTime?: string;
  activities?: string;
}

export default function SquadDetailPage({ params }: { params: { id: string } }) {
  const [squad, setSquad] = useState<Squad | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const { isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();

  useEffect(() => {
    const fetchSquad = async () => {
      try {
        setLoading(true);
        const data = await squadsAPI.getSquad(params.id);
        if (!data) {
          setNotFound(true);
          return;
        }
        setSquad(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        if (message.includes("404") || message.includes("not found")) {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSquad();
  }, [params.id]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      showError("Please log in to join a squad.");
      return;
    }
    setJoining(true);
    try {
      await squadsAPI.joinSquad(params.id);
      success("You have joined the squad!");
      setJoined(true);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to join squad.");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 md:px-8">
          <SkeletonGroup count={6} />
        </div>
      </div>
    );
  }

  if (notFound || !squad) {
    return (
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 md:px-8">
          <Link href="/kingdom/squads" className="flex items-center gap-2 text-purple-vivid hover:underline mb-8">
            <ArrowLeft size={18} /> Back to Squads
          </Link>
          <div className="rounded-[8px] border border-gray-border bg-white p-12 text-center shadow-sm">
            <h1 className="font-heading text-2xl font-bold text-slate mb-2">Squad Not Found</h1>
            <p className="font-body text-base text-gray-text mb-6">
              This squad doesn&apos;t exist or has been removed.
            </p>
            <Link href="/kingdom/squads">
              <Button variant="primary">Browse Squads</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const description = squad.description || "";
  const leaderName = squad.leader?.profile
    ? `${squad.leader.profile.firstName || ""} ${squad.leader.profile.lastName || ""}`.trim()
    : null;
  const memberCount = squad._count?.members ?? squad.members?.length ?? 0;

  return (
    <main className="min-h-screen bg-off-white">
      {/* Hero */}
      <section className="relative flex items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            {squad.name}
          </h1>
          {description && (
            <p className="mt-3 font-body text-lg text-off-white max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 md:px-8">
        <Link href="/kingdom/squads" className="flex items-center gap-2 text-purple-vivid hover:underline mb-8">
          <ArrowLeft size={18} /> Back to Squads
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Leader Profile */}
            <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
              <h2 className="font-heading text-xl font-bold text-slate mb-4">Squad Leader</h2>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-vivid flex-shrink-0">
                  <span className="font-heading text-lg font-bold text-white">
                    {(leaderName || "?").charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-heading text-base font-semibold text-slate">
                    {leaderName || "To Be Announced"}
                  </p>
                  {squad.leader?.profile?.bio && (
                    <p className="mt-2 font-body text-sm text-slate leading-relaxed">{squad.leader.profile.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Meeting Schedule */}
            {(squad.meetingDay || squad.meetingTime) && (
              <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold text-slate mb-4">Meeting Schedule</h2>
                <div className="space-y-3">
                  {squad.meetingDay && (
                    <div className="flex items-center gap-3 font-body text-sm text-slate">
                      <Calendar size={18} className="text-purple flex-shrink-0" />
                      <span>{squad.meetingDay}</span>
                    </div>
                  )}
                  {squad.meetingTime && (
                    <div className="flex items-center gap-3 font-body text-sm text-slate">
                      <Clock size={18} className="text-purple flex-shrink-0" />
                      <span>{squad.meetingTime}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activities */}
            {squad.activities && (
              <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold text-slate mb-4">Activities</h2>
                <div className="flex items-start gap-3">
                  <Activity size={18} className="text-purple flex-shrink-0 mt-0.5" />
                  <p className="font-body text-sm text-slate leading-relaxed whitespace-pre-wrap">
                    {squad.activities}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm sticky top-20">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 text-gray-text font-body text-sm mb-4">
                  <Users size={18} className="text-purple" />
                  <span>{memberCount} members</span>
                </div>
              </div>

              {joined ? (
                <div className="text-center py-4">
                  <Check className="mx-auto h-10 w-10 text-success mb-3" />
                  <h3 className="font-heading text-lg font-bold text-slate mb-1">You&apos;re In!</h3>
                  <p className="font-body text-sm text-gray-text">
                    Welcome to {squad.name}. Check your dashboard for updates.
                  </p>
                </div>
              ) : (
                <>
                  <Button
                    variant="primary"
                    className="w-full bg-[#771996] hover:bg-[#4A1D6E]"
                    onClick={handleJoin}
                    disabled={joining}
                    loading={joining}
                  >
                    {joining ? "Joining..." : "Request to Join"}
                  </Button>
                  {!isAuthenticated && (
                    <p className="mt-4 font-body text-xs text-gray-text text-center">
                      <Link href="/auth/login" className="text-purple-vivid hover:underline">
                        Log in
                      </Link>{" "}
                      to join this squad.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
