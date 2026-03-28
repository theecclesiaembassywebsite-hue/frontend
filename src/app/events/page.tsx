"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import EventCard from "@/components/ui/EventCard";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { events as eventsAPI } from "@/lib/api";
import { SkeletonGroup } from "@/components/ui/Skeleton";

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function EventsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear] = useState(new Date().getFullYear());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await eventsAPI.getEvents(100, 0);
        setEvents(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch events");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <>
      <section className="relative flex items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            Programs & Events
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            Discover what is happening at The Ecclesia Embassy
          </h6>
        </div>
      </section>

      {/* Featured Events */}
      <SectionWrapper variant="lavender" className="!py-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { title: "Feast of Tabernacles", href: "/events/feast-of-tabernacles", desc: "Annual Anniversary" },
            { title: "Gilgal Camp Meetings", href: "/events/gilgal", desc: "Tri-annual Retreat" },
            { title: "As Unto The Lord", href: "/events/as-unto-the-lord", desc: "Monthly Consecration" },
          ].map((e) => (
            <Link key={e.title} href={e.href} className="rounded-[8px] bg-white p-4 shadow-sm hover:shadow-md transition-shadow text-center">
              <h3 className="font-heading text-sm font-bold text-purple">{e.title}</h3>
              <p className="text-[11px] text-gray-text">{e.desc}</p>
            </Link>
          ))}
        </div>
      </SectionWrapper>

      {/* Calendar Month Selector */}
      <SectionWrapper variant="white" className="!py-6">
        <div className="flex items-center justify-center gap-4 mb-6">
          <button onClick={() => setCurrentMonth((m) => (m === 0 ? 11 : m - 1))} className="text-gray-text hover:text-purple transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h2 className="font-heading text-xl font-bold text-slate w-48 text-center">
            {months[currentMonth]} {currentYear}
          </h2>
          <button onClick={() => setCurrentMonth((m) => (m === 11 ? 0 : m + 1))} className="text-gray-text hover:text-purple transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>
      </SectionWrapper>

      {/* Event List */}
      <SectionWrapper variant="off-white" className="!pt-0">
        {loading ? (
          <SkeletonGroup count={5} variant="table-row" />
        ) : error ? (
          <div className="py-12 text-center">
            <p className="font-body text-base text-error">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((e) => {
              const eventDate = new Date(e.date || e.createdAt);
              const day = String(eventDate.getDate()).padStart(2, "0");
              const month = months[eventDate.getMonth()].substring(0, 3).toUpperCase();
              return (
                <EventCard
                  key={e.id}
                  title={e.title}
                  description={e.description}
                  date={eventDate.toLocaleDateString()}
                  day={day}
                  month={month}
                  href={`/events/${e.id}`}
                />
              );
            })}
          </div>
        )}
      </SectionWrapper>
    </>
  );
}
