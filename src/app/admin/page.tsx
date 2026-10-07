"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users, Gift, MapPin, GraduationCap, MessageCircle, Calendar,
  BookOpen, HandHeart, BarChart3, TrendingUp, Eye, Flame,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { admin } from "@/lib/api";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import { formatMoneyByCurrency } from "@/lib/money";

const quickActions = [
  { label: "Manage Members", href: "/admin/members", icon: Users },
  { label: "Giving Reports", href: "/admin/giving", icon: Gift },
  { label: "Manage Content", href: "/admin/content", icon: BookOpen },
  { label: "View Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Manage Events", href: "/admin/events", icon: Calendar },
  { label: "Prayer Requests", href: "/admin/prayer", icon: HandHeart },
];

function AdminOverviewContent() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await admin.getOverview();
        setOverview(data);
      } catch (error) {
        console.error("Failed to fetch admin overview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <SkeletonGroup count={8} />
        <SkeletonGroup count={6} className="mt-8" />
      </div>
    );
  }

  const stats = [
    { label: "Registered Members", value: overview?.totalMembers?.toString() || "0", icon: Users, color: "text-purple", trend: "verified accounts" },
    { label: "Total Giving (Month)", value: formatMoneyByCurrency(overview?.givingMonthByCurrency), icon: Gift, color: "text-success", trend: "this month, by currency" },
    { label: "Weekly Active Users", value: overview?.activeUsers?.toString() || "0", icon: Eye, color: "text-info", trend: "last 7 days" },
    { label: "Active CITH Hubs", value: overview?.cithHubs?.toString() || "0", icon: MapPin, color: "text-purple-vivid", trend: "currently active" },
    { label: "Ecclesia Embassy Community Posts", value: overview?.nationPosts?.toString() || "0", icon: MessageCircle, color: "text-warning", trend: "last 30 days" },
    { label: "Class Enrollments", value: overview?.classEnrollments?.toString() || "0", icon: GraduationCap, color: "text-purple", trend: "all time" },
    { label: "Event Registrations", value: overview?.eventRegistrations?.toString() || "0", icon: Calendar, color: "text-info", trend: "all time" },
    { label: "Total Giving (All Time)", value: formatMoneyByCurrency(overview?.givingByCurrency), icon: Flame, color: "text-warning", trend: "by currency" },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-slate">Dashboard Overview</h1>
        <p className="text-body-small mt-1">Welcome back, Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Icon size={20} className={s.color} />
                <TrendingUp size={14} className="text-success" />
              </div>
              <p className="font-heading text-2xl font-bold text-slate">{s.value}</p>
              <p className="text-[11px] text-gray-text">{s.label}</p>
              <p className="text-[10px] text-success mt-1">{s.trend}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <h2 className="font-heading text-lg font-bold text-slate mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.label}
              href={a.href}
              className="flex items-center gap-3 rounded-[8px] border border-gray-border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <Icon size={20} className="text-purple" />
              <span className="font-heading text-sm font-semibold text-slate">{a.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminOverviewContent />
    </ProtectedRoute>
  );
}
