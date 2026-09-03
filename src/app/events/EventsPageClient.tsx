"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionIntro from "@/components/ui/SectionIntro";
import { events as eventsAPI } from "@/lib/api";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import { StaggerContainer, StaggerItem } from "@/components/ui/Motion";
import { ChevronLeft, ChevronRight, CalendarDays, ArrowRight } from "lucide-react";
import EventCard from "@/components/ui/EventCard";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  slug?: string;
  imageUrl?: string;
  requiresRegistration?: boolean;
  eventType?: string;
};

const HIDDEN_EVENT_SLUGS = new Set(["as-unto-the-lord"]);

const EVENT_TYPE_FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Events" },
  { value: "GENERAL", label: "General" },
  { value: "FEAST_OF_TABERNACLES", label: "Feast of Tabernacles" },
  { value: "GILGAL_CAMP_MEETING", label: "Gilgal Camp Meeting" },
];

const SIGNATURE_GATHERINGS = [
  {
    href: "/events/feast-of-tabernacles",
    kicker: "Annual anniversary",
    title: "Feast of Tabernacles",
    detail:
      "Seven days of celebration each September, hosted in Abuja and open to all \u2014 no registration required.",
  },
  {
    href: "/events/gilgal",
    kicker: "Tri-annual retreat",
    title: "Gilgal Camp Meeting",
    detail:
      "A prophetic camp meeting for realignment, renewal, and refiring. Free, with accommodation and meals.",
  },
];

export default function EventsPageClient() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = (await eventsAPI.getEvents()) as Event[];
        setEvents(
          data.filter((event) => !HIDDEN_EVENT_SLUGS.has(event.slug || event.id))
        );
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load events"
        );
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const d = new Date(event.date);
    const inMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    const matchesType = typeFilter === "ALL" || event.eventType === typeFilter;
    return inMonth && matchesType;
  });

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  return (
    <main data-brand="events">
      <PageHero
        eyebrow="Events & Programs"
        title="What's happening at the Embassy"
        subtitle="Gatherings, feasts, and camp meetings."
        description="Browse the calendar month by month, or go straight to the anniversary Feast of Tabernacles and the Gilgal camp meeting."
        backgroundImage="/site/embassy-building.jpg"
        backgroundPosition="center 82%"
        wash="deep"
        compact
      />

      {/* All Events Section */}
      <SectionWrapper variant="paper">
        <StaggerContainer>
          {/* Month Picker */}
          <StaggerItem>
            <div className="mx-auto mb-10 flex max-w-md items-center gap-3 rounded-full border border-slate/10 bg-white p-2 shadow-sm">
              <button
                onClick={prevMonth}
                aria-label="Previous month"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-text transition-colors hover:bg-[var(--brand-accent-soft)] hover:text-slate"
              >
                <ChevronLeft size={20} />
              </button>
              <h2
                className="flex-1 text-center font-heading text-lg font-bold text-slate sm:text-xl"
                suppressHydrationWarning
              >
                {months[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={nextMonth}
                aria-label="Next month"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-text transition-colors hover:bg-[var(--brand-accent-soft)] hover:text-slate"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </StaggerItem>

          {/* Event Type Filter */}
          <StaggerItem>
            <div className="relative mb-12">
              <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2">
                {EVENT_TYPE_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setTypeFilter(filter.value)}
                    aria-pressed={typeFilter === filter.value}
                    className={`shrink-0 rounded-full border px-5 py-2.5 font-heading text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                      typeFilter === filter.value
                        ? "border-transparent bg-[var(--brand-ink)] text-white"
                        : "border-slate/12 bg-white text-gray-text hover:border-[var(--brand-accent-line)] hover:text-slate"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              {/* Scroll hint fades — only relevant when the row overflows, which happens on narrow screens */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#FFFDF8] to-transparent sm:hidden" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#FFFDF8] to-transparent sm:hidden" />
            </div>
          </StaggerItem>

          {/* Loading State */}
          {loading && (
            <StaggerItem>
              <SkeletonGroup count={6} variant="card" columns={3} />
            </StaggerItem>
          )}

          {/* Error State */}
          {error && !loading && (
            <StaggerItem>
              <div className="mx-auto mb-12 max-w-md rounded-[20px] border border-error/25 bg-error/8 p-6 text-center">
                <p className="font-body text-sm text-error">{error}. Please try again later.</p>
              </div>
            </StaggerItem>
          )}

          {/* Events Grid */}
          {!loading && filteredEvents.length > 0 && (
            <StaggerItem>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event) => {
                  const eventDate = new Date(event.date);
                  const day = eventDate.getDate().toString();
                  const month = eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                  const formattedDate = eventDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  });
                  return (
                    <EventCard
                      key={event.id}
                      title={event.title}
                      description={event.description}
                      date={formattedDate}
                      time={event.time}
                      location={event.location}
                      day={day}
                      month={month}
                      href={`/events/${event.slug || event.id}`}
                      imageUrl={event.imageUrl}
                      requiresRegistration={event.requiresRegistration}
                    />
                  );
                })}
              </div>
            </StaggerItem>
          )}

          {/* Empty State */}
          {!loading && filteredEvents.length === 0 && !error && (
            <StaggerItem>
              <div className="brand-card brand-card--static mx-auto max-w-md p-12 text-center">
                <div className="brand-tile mx-auto h-14 w-14">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-heading text-xl font-bold text-slate">Nothing this month</h3>
                <p className="mx-auto mt-2 max-w-xs font-body text-sm text-gray-text">
                  No {typeFilter === "ALL" ? "" : EVENT_TYPE_FILTERS.find((f) => f.value === typeFilter)?.label + " "}
                  events are scheduled for {months[currentMonth]}. Try another month.
                </p>
              </div>
            </StaggerItem>
          )}
        </StaggerContainer>
      </SectionWrapper>

      {/* SIGNATURE GATHERINGS
          The two occasions the calendar always returns to, given their own
          band so they are reachable without hunting through months. */}
      <SectionWrapper variant="brand-band" hairline>
        <SectionIntro
          align="center"
          tone="dark"
          eyebrow="On every calendar"
          title="The gatherings we always come back to"
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {SIGNATURE_GATHERINGS.map((item) => (
            <Link key={item.href} href={item.href} className="group block h-full">
              <div className="brand-card-dark flex h-full flex-col p-7 md:p-8">
                <p className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--brand-accent-text)]">
                  {item.kicker}
                </p>
                <h3 className="mt-3 font-heading text-2xl font-bold text-white md:text-[28px]">
                  {item.title}
                </h3>
                <p className="mt-4 flex-1 font-body text-sm leading-7 text-white/64">
                  {item.detail}
                </p>
                <span className="mt-7 inline-flex items-center gap-2 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-white">
                  Read more
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </SectionWrapper>
    </main>
  );
}
