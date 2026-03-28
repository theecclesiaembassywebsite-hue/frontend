"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  User,
  Gift,
  Calendar,
  BookOpen,
  HandHeart,
  Users,
  MapPin,
  GraduationCap,
  Flame,
  Star,
  Award,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { engagement, profile } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

const dashboardCards = [
  { title: "My Profile", icon: User, href: "/dashboard/profile", desc: "View and update your bio-data" },
  { title: "Giving History", icon: Gift, href: "/dashboard/giving", desc: "View transactions and receipts" },
  { title: "My Events", icon: Calendar, href: "/events", desc: "Registered events and upcoming" },
  { title: "My Resources", icon: BookOpen, href: "/resources/audio", desc: "Downloaded resources and watch history" },
  { title: "Prayer Requests", icon: HandHeart, href: "/dashboard/prayer", desc: "Track your prayer requests" },
  { title: "My Squad", icon: Users, href: "/kingdom/squads", desc: "Squad info and activities" },
  { title: "My Hub", icon: MapPin, href: "/dashboard/hub", desc: "Church-in-the-Home details" },
  { title: "Intentionality Class", icon: GraduationCap, href: "/grow/intentionality-class", desc: "Course progress and certificates" },
];

const badges = [
  { name: "7-Day Streak", icon: Flame, threshold: 7 },
  { name: "30-Day Streak", icon: Star, threshold: 30 },
  { name: "90-Day Streak", icon: Award, threshold: 90 },
];

interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

interface ProfileData {
  firstName?: string;
  lastName?: string;
}

function DashboardContent() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [streakRes, profileRes] = await Promise.all([
          engagement.getStreak().catch(() => null),
          profile.getProfile(user?.id || "").catch(() => null),
        ]);
        setStreakData(streakRes);
        setProfileData(profileRes as ProfileData | null);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const userName = profileData?.firstName
    ? `${profileData.firstName}${profileData.lastName ? ` ${profileData.lastName}` : ""}`
    : user?.profile?.firstName || "Member";

  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;

  const earnedBadges = badges.map((b) => ({
    ...b,
    earned: currentStreak >= b.threshold,
  }));

  if (loading) {
    return (
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:px-8">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton variant="circle" />
            <div className="flex-1">
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
          <SkeletonGroup count={4} variant="card" className="grid grid-cols-2 gap-4 md:grid-cols-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-off-white min-h-screen">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-light">
            <User className="h-8 w-8 text-purple/50" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate">
              Welcome Back, {userName}
            </h1>
            <p className="font-body text-sm text-gray-text">
              Your personal dashboard
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
          <div className="rounded-[8px] bg-white border border-gray-border p-4 text-center shadow-sm">
            <Flame className="mx-auto h-6 w-6 text-warning mb-1" />
            <p className="font-heading text-2xl font-bold text-purple">
              {currentStreak}
            </p>
            <p className="text-[11px] text-gray-text">Day Streak</p>
          </div>
          <div className="rounded-[8px] bg-white border border-gray-border p-4 text-center shadow-sm">
            <Star className="mx-auto h-6 w-6 text-purple-vivid mb-1" />
            <p className="font-heading text-2xl font-bold text-purple">
              {longestStreak}
            </p>
            <p className="text-[11px] text-gray-text">Longest Streak</p>
          </div>
          <div className="rounded-[8px] bg-white border border-gray-border p-4 text-center shadow-sm">
            <Gift className="mx-auto h-6 w-6 text-success mb-1" />
            <p className="font-heading text-2xl font-bold text-purple">
              —
            </p>
            <p className="text-[11px] text-gray-text">Total Giving</p>
          </div>
          <div className="rounded-[8px] bg-white border border-gray-border p-4 text-center shadow-sm">
            <Calendar className="mx-auto h-6 w-6 text-info mb-1" />
            <p className="font-heading text-2xl font-bold text-purple">
              —
            </p>
            <p className="text-[11px] text-gray-text">Events Registered</p>
          </div>
        </div>

        {/* Badges */}
        <div className="mb-8 rounded-[8px] bg-white border border-gray-border p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-slate mb-3">
            Engagement Badges
          </h3>
          <div className="flex gap-4">
            {earnedBadges.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.name}
                  className={`flex flex-col items-center gap-1 rounded-[8px] border p-3 text-center ${
                    b.earned
                      ? "border-purple bg-purple-light/30"
                      : "border-gray-border opacity-40"
                  }`}
                >
                  <Icon className={`h-6 w-6 ${b.earned ? "text-purple" : "text-gray-text"}`} />
                  <span className="text-[10px] font-heading font-semibold text-slate">
                    {b.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group flex flex-col rounded-[8px] border border-gray-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <Icon className="h-6 w-6 text-purple mb-2" />
                <h3 className="font-heading text-sm font-bold text-slate group-hover:text-purple-vivid transition-colors">
                  {card.title}
                </h3>
                <p className="mt-1 font-body text-xs text-gray-text">
                  {card.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
