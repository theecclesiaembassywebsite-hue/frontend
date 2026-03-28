"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { nation, type Group } from "@/lib/api";
import { SkeletonGroup } from "@/components/ui/Skeleton";

export default function GroupsPage() {
  const { success, error } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    try {
      setLoading(true);
      const groupsData = await nation.getGroups();
      setGroups(groupsData);
    } catch (err) {
      error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinGroup(groupId: string) {
    try {
      setJoiningGroupId(groupId);
      await nation.joinGroup(groupId);
      success("Joined group successfully!");
      loadGroups();
    } catch (err) {
      error("Failed to join group");
    } finally {
      setJoiningGroupId(null);
    }
  }

  return (
    <ProtectedRoute>
      <>
        <section className="relative flex items-center justify-center py-16 md:py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
          <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
          <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
            <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
              Groups
            </h1>
            <h6 className="mt-2 font-serif text-base font-light text-off-white">
              Join squad-based and topic-based discussions
            </h6>
          </div>
        </section>

        <SectionWrapper variant="off-white">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <SkeletonGroup count={6} variant="card" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex flex-col rounded-[8px] border border-gray-border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-light">
                      <Users className="h-5 w-5 text-purple" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-bold text-slate">
                        {group.name}
                      </h3>
                      <p className="text-[11px] text-gray-text">
                        {group.memberCount || 0} members
                      </p>
                    </div>
                  </div>
                  <p className="font-body text-sm text-gray-text leading-relaxed flex-1">
                    {group.description}
                  </p>
                  <Button
                    variant="primary"
                    className="mt-4 text-xs py-2 min-w-0 w-full"
                    disabled={joiningGroupId === group.id}
                    onClick={() => handleJoinGroup(group.id)}
                  >
                    {joiningGroupId === group.id ? "Joining..." : "Join Group"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </SectionWrapper>
      </>
    </ProtectedRoute>
  );
}
