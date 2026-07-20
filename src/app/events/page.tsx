"use client";

import { useState, useEffect } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { events as eventsAPI } from "@/lib/api";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/Motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

export default function EventsPage() {
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
    <main>
      {/* Hero Section */}
      <section
        className="relative min-h-[260px] sm:h-80 md:h-96 flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <FadeIn className="relative z-10 text-center px-4 max-w-2xl">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-white mb-4">
            Events & Programs
          </h1>
          <p className="font-body text-lg md:text-xl text-gray-100 mb-6">
            What's happening at the Embassy
          </p>
          <div className="h-1 w-16 bg-gradient-to-r from-purple to-purple-vivid mx-auto"></div>
        </FadeIn>
      </section>

      {/* All Events Section */}
      <SectionWrapper variant="off-white">
        <StaggerContainer>
          {/* Month Picker */}
          <StaggerItem>
            <div className="flex items-center justify-center gap-4 sm:gap-6 mb-8">
              <button
                onClick={prevMonth}
                className="text-gray-text hover:text-purple transition-colors p-3 rounded-full hover:bg-lavender"
              >
                <ChevronLeft size={24} />
              </button>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate w-44 sm:w-64 text-center" suppressHydrationWarning>
                {months[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={nextMonth}
                className="text-gray-text hover:text-purple transition-colors p-3 rounded-full hover:bg-lavender"
              >
                <ChevronRight size={24} />
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
                    className={`shrink-0 rounded-full px-5 py-2 font-body text-sm font-semibold transition-colors ${
                      typeFilter === filter.value
                        ? "bg-purple text-white"
                        : "bg-white text-gray-text border border-gray-border hover:border-purple hover:text-purple"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              {/* Scroll hint fades — only relevant when the row overflows, which happens on narrow screens */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#FAFAF8] to-transparent sm:hidden" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#FAFAF8] to-transparent sm:hidden" />
            </div>
          </StaggerItem>

          {/* Loading State */}
          {loading && (
            <StaggerItem>
              <SkeletonGroup count={3} variant="card" />
            </StaggerItem>
          )}

          {/* Error State */}
          {error && !loading && (
            <StaggerItem>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-12">
                <p className="font-body text-red-700">
                  {error}. Please try again later.
                </p>
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
              <div className="text-center py-12">
                <p className="font-body text-gray-text text-lg">
                  No {typeFilter === "ALL" ? "" : EVENT_TYPE_FILTERS.find((f) => f.value === typeFilter)?.label + " "}
                  events scheduled for {months[currentMonth]}.
                </p>
              </div>
            </StaggerItem>
          )}
        </StaggerContainer>
      </SectionWrapper>
    </main>
  );
}
