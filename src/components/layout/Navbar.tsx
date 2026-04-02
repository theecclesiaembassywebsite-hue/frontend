"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Search, ChevronDown, User, LogOut, LayoutDashboard, Settings, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { label: "HOME", href: "/" },
  {
    label: "ABOUT US",
    href: "/about",
    children: [
      { label: "Our Vision", href: "/about" },
      { label: "Leadership", href: "/about/leadership" },
      { label: "The Ecclesia Experience", href: "/about/experience" },
    ],
  },
  {
    label: "RESOURCES",
    href: "/resources",
    children: [
      { label: "Audio Archive", href: "/resources/audio" },
      { label: "Video Messages", href: "/resources/video" },
      { label: "Ecclesia Library", href: "/resources/library" },
      { label: "Ecclesia Music", href: "/resources/music" },
    ],
  },
  {
    label: "PROGRAMS",
    href: "/events",
    children: [
      { label: "Events Calendar", href: "/events" },
      { label: "Feast of Tabernacles", href: "/events/feast-of-tabernacles" },
      { label: "Gilgal Camp Meetings", href: "/events/gilgal" },
      { label: "As Unto The Lord", href: "/events/as-unto-the-lord" },
    ],
  },
  { label: "LIVESTREAM", href: "/live" },
  { label: "GIVE", href: "/give" },
  { label: "ECCLESIA NATION", href: "/nation" },
  {
    label: "GROW",
    href: "/grow",
    children: [
      { label: "Grow with Us", href: "/grow" },
      { label: "Church in the House", href: "/cith" },
      { label: "Intentionality Class", href: "/grow/intentionality-class" },
    ],
  },
  {
    label: "KINGDOM",
    href: "/kingdom",
    children: [
      { label: "Kingdom Life Squads", href: "/kingdom/squads" },
      { label: "Kingdom Influencing Platform", href: "/kingdom/kip" },
    ],
  },
  {
    label: "TRAINING",
    href: "/training",
    children: [
      { label: "TEMA", href: "/training/tema" },
      { label: "KISOLAM", href: "/training/kisolam" },
      { label: "EIS", href: "/training/eis" },
    ],
  },
  { label: "CONTACT", href: "/contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Top header bar — logo area */}
      <header className="bg-slate">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-5 sm:px-6 md:px-8">
          <Link href="/" className="font-heading text-2xl font-bold text-white md:text-[42px] md:leading-[48px] transition-opacity hover:opacity-90">
            The Ecclesia Embassy
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative z-[60]" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-vivid">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden sm:block font-body text-sm">
                    {user.profile?.firstName || "Account"}
                  </span>
                  <ChevronDown size={14} className="hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-[8px] bg-white shadow-lg border border-gray-border overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-border">
                        <p className="font-heading text-sm font-semibold text-slate truncate">
                          {user.profile?.firstName} {user.profile?.lastName}
                        </p>
                        <p className="font-body text-[11px] text-gray-text truncate">{user.email}</p>
                      </div>
                      {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 font-body text-sm text-purple font-semibold hover:bg-lavender transition-colors"
                        >
                          <Shield size={14} /> Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 font-body text-sm text-slate hover:bg-lavender transition-colors"
                      >
                        <LayoutDashboard size={14} /> My Dashboard
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 font-body text-sm text-slate hover:bg-lavender transition-colors"
                      >
                        <Settings size={14} /> My Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          window.location.href = "/";
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 font-body text-sm text-error hover:bg-error/5 transition-colors border-t border-gray-border"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:block font-heading text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            )}
            <button
              aria-label="Search"
              className="text-white/80 hover:text-white transition-colors"
            >
              <Search size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation bar — sticky */}
      <nav
        className={cn(
          "sticky top-0 z-50 bg-slate transition-shadow duration-300",
          scrolled ? "shadow-lg" : "shadow-md"
        )}
      >
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-8">
          {/* Desktop nav */}
          <div className="hidden lg:flex h-[50px] items-center gap-0">
            {navLinks.map((link, i) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.children && setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "text-nav-link text-white px-3 py-4 flex items-center gap-1",
                    "hover:text-lavender transition-colors duration-200",
                    "border-b-2 border-transparent hover:border-purple-vivid"
                  )}
                >
                  {link.label}
                  {link.children && (
                    <motion.span
                      animate={{ rotate: openDropdown === link.label ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={12} />
                    </motion.span>
                  )}
                </Link>

                {/* Separator */}
                {i < navLinks.length - 1 && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 text-xs select-none">
                    |
                  </span>
                )}

                {/* Dropdown */}
                <AnimatePresence>
                  {link.children && openDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute left-0 top-full bg-white rounded-md shadow-lg py-2 min-w-[220px] z-50 border border-gray-border/50"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 font-body text-sm text-slate hover:bg-lavender hover:text-purple transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden h-[50px] items-center justify-end">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="text-white"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 h-full w-[300px] bg-slate overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <span className="font-heading text-lg font-bold text-white">
                  Menu
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* User section */}
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-6 py-4 border-b border-white/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-vivid">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-heading text-sm font-bold text-white">
                      {user.profile?.firstName} {user.profile?.lastName}
                    </p>
                    <p className="font-body text-xs text-white/50">View Dashboard</p>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-6 py-4 border-b border-white/10 font-heading text-sm font-bold text-purple-vivid"
                >
                  Sign In / Register
                </Link>
              )}

              <div className="flex flex-col py-2">
                {navLinks.map((link) => (
                  <div key={link.label}>
                    <Link
                      href={link.href}
                      onClick={() => !link.children && setMobileOpen(false)}
                      className="block px-6 py-3 text-nav-link text-white hover:text-lavender hover:bg-white/5 transition-colors"
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="pl-10 pb-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className="block py-2 font-body text-sm text-white/60 hover:text-white transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
