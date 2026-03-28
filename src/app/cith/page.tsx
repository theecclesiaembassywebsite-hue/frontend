"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MapPin, Clock, User, Search, Globe, Home } from "lucide-react";
import { cith } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { SkeletonGroup } from "@/components/ui/Skeleton";

export default function CITHPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hubs, setHubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  useEffect(() => {
    const fetchHubs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await cith.getHubs();
        setHubs(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch hubs");
        setHubs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHubs();
  }, []);

  const filtered = hubs.filter(
    (h) =>
      !searchQuery ||
      h.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleJoinHub = async (hubId: string) => {
    setJoining(hubId);
    try {
      await cith.joinHub(hubId);
      success("Successfully joined the hub!");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to join hub");
    } finally {
      setJoining(null);
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            Church in the Home
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            Find a hub near you or start one in your home
          </h6>
        </div>
      </section>

      {/* Quick Actions */}
      <SectionWrapper variant="lavender" className="!py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/cith/ehub"
            className="flex items-center gap-3 rounded-[8px] bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <Globe className="h-8 w-8 text-purple shrink-0" />
            <div>
              <h3 className="font-heading text-sm font-bold text-slate">Join the e-Hub</h3>
              <p className="text-[11px] text-gray-text">Online fellowship from anywhere</p>
            </div>
          </Link>
          <Link
            href="/cith/register"
            className="flex items-center gap-3 rounded-[8px] bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <Home className="h-8 w-8 text-purple shrink-0" />
            <div>
              <h3 className="font-heading text-sm font-bold text-slate">Register Your Home</h3>
              <p className="text-[11px] text-gray-text">Host a hub in your community</p>
            </div>
          </Link>
          <Link
            href="/dashboard/hub"
            className="flex items-center gap-3 rounded-[8px] bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <User className="h-8 w-8 text-purple shrink-0" />
            <div>
              <h3 className="font-heading text-sm font-bold text-slate">Hub Leader Dashboard</h3>
              <p className="text-[11px] text-gray-text">Manage your hub</p>
            </div>
          </Link>
        </div>
      </SectionWrapper>

      {/* Search */}
      <SectionWrapper variant="white" className="!py-8">
        <div className="mx-auto max-w-md">
          <h2 className="font-heading text-[28px] font-bold text-slate text-center mb-4">
            Find a Hub Near You
          </h2>
          <div className="relative">
            <Input
              id="search"
              placeholder="Search by area or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-text pointer-events-none" />
          </div>
        </div>
      </SectionWrapper>

      {/* Hub List */}
      <SectionWrapper variant="off-white" className="!pt-4">
        {loading ? (
          <>
            <p className="text-body-small mb-4 h-5 w-32 bg-gray-border rounded animate-pulse"></p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <SkeletonGroup count={6} variant="card" />
            </div>
          </>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="font-body text-base text-error">{error}</p>
          </div>
        ) : (
          <>
            <p className="text-body-small mb-4">{filtered.length} hub{filtered.length !== 1 ? "s" : ""} found</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((hub) => (
                <div key={hub.id} className="rounded-[8px] border border-gray-border bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-light">
                      <MapPin className="h-5 w-5 text-purple" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading text-base font-bold text-slate">{hub.name}</h3>
                      <p className="text-body-small">{hub.area || "Area"}, {hub.city || "City"}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-body text-gray-text">
                      <User size={14} /> Led by {hub.leader || "TBA"}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-body text-gray-text">
                      <Clock size={14} /> {hub.day || "TBA"}s at {hub.time || "TBA"}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-body text-gray-text">
                      <User size={14} /> {hub.members || 0} members
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    className="mt-4 w-full text-xs py-2 min-w-0"
                    disabled={joining === hub.id}
                    onClick={() => handleJoinHub(hub.id)}
                  >
                    {joining === hub.id ? "Joining..." : "Request to Join"}
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </SectionWrapper>
    </>
  );
}
