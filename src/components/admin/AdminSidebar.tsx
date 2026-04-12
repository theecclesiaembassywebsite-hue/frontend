"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Gift, FileText, MapPin, GraduationCap,
  MessageCircle, Calendar, BookOpen, HandHeart, Quote, BarChart3,
  Radio, Settings, UserPlus, Clock,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Members", href: "/admin/members", icon: Users },
  { label: "First Timers", href: "/admin/first-timers", icon: UserPlus },
  { label: "Giving Reports", href: "/admin/giving", icon: Gift },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "CITH Hubs", href: "/admin/cith", icon: MapPin },
  { label: "Squads", href: "/admin/squads", icon: Users },
  { label: "Intentionality Class", href: "/admin/class", icon: GraduationCap },
  { label: "Ecclesia Nation", href: "/admin/nation", icon: MessageCircle },
  { label: "Resources", href: "/admin/resources", icon: BookOpen },
  { label: "Service Schedule", href: "/admin/schedule", icon: Clock },
  { label: "Livestream", href: "/admin/livestream", icon: Radio },
  { label: "Prayer Requests", href: "/admin/prayer", icon: HandHeart },
  { label: "Testimonies", href: "/admin/testimonies", icon: Quote },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-gray-border bg-white min-h-screen hidden lg:block">
      <div className="p-4 border-b border-gray-border">
        <h2 className="font-heading text-sm font-bold text-purple">Admin Dashboard</h2>
        <p className="text-[10px] text-gray-text">The Ecclesia Embassy</p>
      </div>
      <nav className="p-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-[4px] px-3 py-2 text-sm font-body transition-colors",
                active
                  ? "bg-purple-light text-purple font-semibold"
                  : "text-gray-text hover:bg-off-white hover:text-slate"
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
