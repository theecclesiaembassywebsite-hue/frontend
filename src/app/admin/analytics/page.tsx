"use client";

import { useEffect, useState } from "react";
import {
  Users, Eye, Gift, MapPin, MessageCircle, GraduationCap, Calendar,
  BookOpen, TrendingUp,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { admin } from "@/lib/api";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

function AdminAnalyticsContent() {
  const [overview, setOverview] = useState<any>(null);
  const [engagement, setEngagement] = useState<any>(null);
  const [growth, setGrowth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewData, engagementData, growthData] = await Promise.all([
          admin.getOverview(),
          admin.getEngagementAnalytics(),
          admin.getGrowthAnalytics(),
        ]);
        setOverview(overviewData);
        setEngagement(engagementData);
        setGrowth(growthData);
      } catch (err) {
        error("Failed to load analytics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [error]);

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="font-heading text-2xl font-bold text-slate mb-6">Analytics Dashboard</h1>
        <SkeletonGroup count={8} />
      </div>
    );
  }

  const metrics = [
    { label: "Registered Members", value: overview?.totalMembers?.toString() || "0", icon: Users, target: "300+", progress: Math.min((overview?.totalMembers / 300) * 100, 100) || 0 },
    { label: "Weekly Active Users", value: overview?.activeUsers?.toString() || "0", icon: Eye, target: "500+", progress: Math.min((overview?.activeUsers / 500) * 100, 100) || 0 },
    { label: "Online Giving", value: overview?.totalGiving ? `$${Number(overview.totalGiving).toLocaleString()}` : "$0", icon: Gift, target: "40%", progress: 0 },
    { label: "Active CITH Hubs", value: overview?.cithHubs?.toString() || "0", icon: MapPin, target: "30+", progress: Math.min((overview?.cithHubs / 30) * 100, 100) || 0 },
    { label: "Ecclesia Nation (Monthly)", value: overview?.nationPosts?.toString() || "0", icon: MessageCircle, target: "200+", progress: Math.min((overview?.nationPosts / 200) * 100, 100) || 0 },
    { label: "Class Enrollments", value: overview?.classEnrollments?.toString() || "0", icon: GraduationCap, target: "50+", progress: Math.min((overview?.classEnrollments / 50) * 100, 100) || 0 },
    { label: "Event Registrations", value: overview?.eventRegistrations?.toString() || "0", icon: Calendar, target: "100+", progress: Math.min((overview?.eventRegistrations / 100) * 100, 100) || 0 },
    { label: "Total Badges", value: engagement?.totalBadges?.toString() || "0", icon: BookOpen, target: "100+", progress: Math.min((engagement?.totalBadges / 100) * 100, 100) || 0 },
  ];

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-heading text-2xl font-bold text-slate mb-2">Analytics Dashboard</h1>
      <p className="text-body-small mb-8">Success metrics tracking and growth analytics</p>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <Icon size={18} className="text-purple" />
                <span className={`text-[10px] font-heading font-bold ${m.progress >= 100 ? "text-success" : "text-warning"}`}>
                  {m.progress >= 100 ? "Target Met" : "In Progress"}
                </span>
              </div>
              <p className="font-heading text-2xl font-bold text-slate">{m.value}</p>
              <p className="text-[11px] text-gray-text">{m.label}</p>
              <div className="mt-2 h-1.5 rounded-full bg-off-white overflow-hidden">
                <div
                  className={`h-full rounded-full ${m.progress >= 100 ? "bg-success" : "bg-warning"}`}
                  style={{ width: `${Math.min(m.progress, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-text mt-1">Target: {m.target}</p>
            </div>
          );
        })}
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg font-bold text-slate mb-4 flex items-center gap-2">
            <Eye size={20} className="text-info" />
            Engagement Metrics
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-[11px] text-gray-text">Average Watch Streak</p>
              <p className="font-heading text-2xl font-bold text-slate">{engagement?.avgStreak || "0"} days</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-text">Monthly Active Users</p>
              <p className="font-heading text-2xl font-bold text-info">{overview?.activeUsers || "0"}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-text">Content Interactions</p>
              <p className="font-heading text-2xl font-bold text-purple">{((engagement?.posts || 0) + (engagement?.comments || 0) + (engagement?.likes || 0)) || "0"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg font-bold text-slate mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-success" />
            Growth Summary
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-[11px] text-gray-text">Member Growth (Month)</p>
              <p className="font-heading text-2xl font-bold text-success">{(() => { const g = Array.isArray(growth) ? growth : []; if (g.length < 2) return "0"; const prev = g[g.length - 2]?.count || 0; const curr = g[g.length - 1]?.count || 0; return prev ? Math.round(((curr - prev) / prev) * 100) : "0"; })()}%</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-text">New Signups</p>
              <p className="font-heading text-2xl font-bold text-slate">{Array.isArray(growth) && growth.length > 0 ? growth[growth.length - 1]?.count || "0" : "0"}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-text">Retention Rate</p>
              <p className="font-heading text-2xl font-bold text-info">N/A</p>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Trend Chart (CSS-based) */}
      <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
        <h2 className="font-heading text-lg font-bold text-slate mb-4">Member Growth Trend</h2>
        <div className="space-y-3">
          {(Array.isArray(growth) ? growth : []).map((item: any, idx: number) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-heading font-semibold text-slate">{item.month}</p>
                <p className="text-[11px] font-heading font-bold text-purple">{item.count} members</p>
              </div>
              <div className="h-2 rounded-full bg-off-white overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple transition-all"
                  style={{ width: `${Math.min((item.count / 350) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminAnalyticsContent />
    </ProtectedRoute>
  );
}
