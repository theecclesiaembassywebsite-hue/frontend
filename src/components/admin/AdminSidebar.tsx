"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard, Users, Gift, FileText, MapPin, GraduationCap,
  MessageCircle, Calendar, BookOpen, HandHeart, Quote, BarChart3,
  Radio, UserPlus, Clock, Award, Image,
} from "lucide-react";

const allNavItems = [
  { label: "Overview",            href: "/admin",              icon: LayoutDashboard, roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Analytics",           href: "/admin/analytics",    icon: BarChart3,       roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Members",             href: "/admin/members",      icon: Users,           roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "First Timers",        href: "/admin/first-timers", icon: UserPlus,        roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Giving Reports",      href: "/admin/giving",       icon: Gift,            roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Content",             href: "/admin/content",      icon: FileText,        roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Events",              href: "/admin/events",       icon: Calendar,        roles: ["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER"] },
  { label: "Experience Gallery",  href: "/admin/gallery",      icon: Image,           roles: ["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER"] },
  { label: "Testimonies",         href: "/admin/testimonies",  icon: Quote,           roles: ["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER"] },
  { label: "CITH Hubs",           href: "/admin/cith",         icon: MapPin,          roles: ["ADMIN", "SUPER_ADMIN", "CHURCH_SERVANT_COORDINATOR"] },
  { label: "Squads",              href: "/admin/squads",       icon: Users,           roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Intentionality Class",href: "/admin/class",        icon: GraduationCap,   roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Training",            href: "/admin/training",     icon: Award,           roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Ecclesia Embassy Community", href: "/admin/community", icon: MessageCircle,   roles: ["ADMIN", "SUPER_ADMIN", "MODERATOR"] },
  { label: "Resources",           href: "/admin/resources",    icon: BookOpen,        roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Service Schedule",    href: "/admin/schedule",     icon: Clock,           roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Livestream",          href: "/admin/livestream",   icon: Radio,           roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Prayer Requests",     href: "/admin/prayer",       icon: HandHeart,       roles: ["ADMIN", "SUPER_ADMIN"] },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role ?? "";

  const navItems = allNavItems.filter((item) => item.roles.includes(role));

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
