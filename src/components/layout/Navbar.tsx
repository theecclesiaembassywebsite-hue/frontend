"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search, ChevronDown } from "lucide-react";

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
      { label: "Church in the Home", href: "/cith" },
      { label: "Kingdom Life Squads", href: "/kingdom/squads" },
      { label: "Intentionality Class", href: "/grow/intentionality-class" },
    ],
  },
  { label: "CONTACT", href: "/contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <>
      {/* Top header bar — logo area */}
      <header className="bg-slate">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-5 sm:px-6 md:px-8">
          <Link href="/" className="font-heading text-2xl font-bold text-white md:text-[42px] md:leading-[48px]">
            The Ecclesia Embassy
          </Link>
          <button
            aria-label="Search"
            className="text-white hover:text-lavender transition-colors"
          >
            <Search size={24} />
          </button>
        </div>
      </header>

      {/* Navigation bar — sticky */}
      <nav className="sticky top-0 z-50 bg-slate shadow-md">
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
                    "hover:text-lavender transition-colors duration-150",
                    "border-b-2 border-transparent hover:border-purple-vivid"
                  )}
                >
                  {link.label}
                  {link.children && <ChevronDown size={12} />}
                </Link>

                {/* Separator */}
                {i < navLinks.length - 1 && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 text-xs select-none">
                    |
                  </span>
                )}

                {/* Dropdown */}
                {link.children && openDropdown === link.label && (
                  <div className="absolute left-0 top-full bg-white rounded-[4px] shadow-lg py-2 min-w-[220px] z-50">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 font-body text-sm text-slate hover:bg-lavender transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
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
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-[280px] bg-slate overflow-y-auto">
            <div className="flex items-center justify-between p-4">
              <span className="font-heading text-lg font-bold text-white">
                Menu
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => !link.children && setMobileOpen(false)}
                    className="block px-6 py-3 text-nav-link text-white hover:text-lavender transition-colors"
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="pl-10">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block py-2 font-body text-sm text-white/70 hover:text-white transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
