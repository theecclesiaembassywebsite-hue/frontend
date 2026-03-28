"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Button from "@/components/ui/Button";
import { Users, Calendar, User } from "lucide-react";
import { useState, useEffect } from "react";
import { squads as squadsAPI } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { SkeletonGroup } from "@/components/ui/Skeleton";

export default function SquadsPage() {
  const [squads, setSquads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  useEffect(() => {
    const fetchSquads = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await squadsAPI.getSquads();
        setSquads(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch squads");
        setSquads([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSquads();
  }, []);

  const handleJoinSquad = async (squadId: string) => {
    setJoining(squadId);
    try {
      await squadsAPI.joinSquad(squadId);
      success("Successfully joined the squad!");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to join squad");
    } finally {
      setJoining(null);
    }
  }
  return (
    <>
      <section className="relative flex items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            Kingdom Life Squads
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            Find your place of service and connect with your team
          </h6>
        </div>
      </section>

      <SectionWrapper variant="white">
        {loading ? (
          <SkeletonGroup count={4} variant="card" className="space-y-6" />
        ) : error ? (
          <div className="py-12 text-center">
            <p className="font-body text-base text-error">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {squads.map((squad) => (
              <div key={squad.id} className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-light">
                        <Users className="h-5 w-5 text-purple" />
                      </div>
                      <div>
                        <h3 className="font-heading text-lg font-bold text-slate">{squad.name}</h3>
                        <div className="flex items-center gap-3 text-body-small">
                          <span className="flex items-center gap-1"><User size={12} /> {squad.leader || "Leader"}</span>
                          <span className="flex items-center gap-1"><Calendar size={12} /> {squad.day || "TBA"} at {squad.time || "TBA"}</span>
                        </div>
                      </div>
                    </div>
                    <p className="font-body text-sm text-gray-text leading-relaxed mt-2">{squad.description || squad.desc}</p>
                    <p className="mt-2 text-xs text-gray-text">
                      <span className="font-heading font-semibold text-slate">Activities:</span> {squad.activities || "See details"}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    className="text-xs py-2 px-5 min-w-0 shrink-0 self-start"
                    disabled={joining === squad.id}
                    onClick={() => handleJoinSquad(squad.id)}
                  >
                    {joining === squad.id ? "Joining..." : "Request to Join"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionWrapper>
    </>
  );
}
