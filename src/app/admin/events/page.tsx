"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { Search, Plus, Calendar, Users, MapPin, Clock, Pencil } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { events as eventsAPI } from "@/lib/api";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const statusBadge: Record<string, string> = {
  UPCOMING: "bg-info/10 text-info",
  ONGOING: "bg-success/10 text-success",
  COMPLETED: "bg-gray-text/10 text-gray-text",
  CANCELLED: "bg-error/10 text-error",
};

function AdminEventsContent() {
  const [eventList, setEventList] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    capacity: "",
  });
  const { success, error } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsAPI.getEvents(20, 0);
        setEventList(data);
        setFilteredEvents(data);
      } catch (err) {
        error("Failed to load events");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [error]);

  useEffect(() => {
    const filtered = eventList.filter((e) => {
      const matchesSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || e.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredEvents(filtered);
  }, [search, statusFilter, eventList]);

  const handleCreateEvent = async () => {
    if (!formData.title || !formData.date || !formData.location) {
      error("Please fill in all required fields");
      return;
    }

    try {
      const newEvent = await eventsAPI.createEvent({
        ...formData,
        capacity: parseInt(formData.capacity) || 100,
      });
      setEventList([newEvent, ...eventList]);
      setShowCreateModal(false);
      setFormData({ title: "", description: "", date: "", location: "", capacity: "" });
      success("Event created successfully");
    } catch (err) {
      error("Failed to create event");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="font-heading text-2xl font-bold text-slate mb-6">Event Management</h1>
        <SkeletonGroup count={5} />
      </div>
    );
  }

  const totalRegistrations = eventList.reduce((s, e) => s + (e.registered || 0), 0);
  const upcomingCount = eventList.filter((e) => e.status === "UPCOMING").length;

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate">Event Management</h1>
          <p className="text-body-small mt-1">Create, manage, and track event registrations</p>
        </div>
        <Button variant="primary" className="text-xs py-2 px-4 min-w-0" onClick={() => setShowCreateModal(true)}>
          <Plus size={14} className="mr-1" /> Create Event
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={16} className="text-purple" />
            <p className="text-[11px] text-gray-text">Total Events</p>
          </div>
          <p className="font-heading text-xl font-bold text-slate">{eventList.length}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-info" />
            <p className="text-[11px] text-gray-text">Upcoming</p>
          </div>
          <p className="font-heading text-xl font-bold text-info">{upcomingCount}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-success" />
            <p className="text-[11px] text-gray-text">Total Registrations</p>
          </div>
          <p className="font-heading text-xl font-bold text-success">{totalRegistrations}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={16} className="text-warning" />
            <p className="text-[11px] text-gray-text">Ongoing Now</p>
          </div>
          <p className="font-heading text-xl font-bold text-warning">{eventList.filter((e) => e.status === "ONGOING").length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end mb-4">
        <div className="flex-1 relative">
          <Input id="search" placeholder="Search events or locations..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-text pointer-events-none" />
        </div>
        <div className="w-full md:w-44">
          <Select id="status" options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto rounded-[8px] border border-gray-border bg-white shadow-sm">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-border bg-off-white">
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Event</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Date</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Location</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Registrations</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Status</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-border">
            {filteredEvents.map((e) => {
              const fillPercent = Math.round(((e.registered || 0) / (e.capacity || 100)) * 100);
              return (
                <tr key={e.id} className="hover:bg-off-white/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-purple/50" />
                      <span className="font-heading text-sm font-semibold text-slate">{e.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-body text-sm text-slate">{e.date}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} className="text-gray-text" />
                      <span className="font-body text-sm text-gray-text">{e.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-off-white rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${fillPercent >= 90 ? "bg-error" : fillPercent >= 70 ? "bg-warning" : "bg-purple"}`}
                          style={{ width: `${Math.min(fillPercent, 100)}%` }}
                        />
                      </div>
                      <span className="font-heading text-xs font-semibold text-slate">{e.registered || 0}/{e.capacity || 100}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-heading font-semibold ${statusBadge[e.status] || "bg-slate/10 text-slate"}`}>
                      {e.status || "UPCOMING"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="rounded-[4px] p-1.5 text-purple-vivid hover:bg-purple/10 transition-colors" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button className="text-xs font-heading font-semibold text-purple-vivid hover:underline">View</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-body-small">{filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}</p>

      {/* Create Event Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Event">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Event Title</label>
            <input
              type="text"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="e.g., Easter Celebration"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Description</label>
            <textarea
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="Event details..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Date</label>
            <input
              type="datetime-local"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Location</label>
            <input
              type="text"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="e.g., Main Auditorium"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Capacity</label>
            <input
              type="number"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="e.g., 200"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="primary" className="flex-1" onClick={handleCreateEvent}>Create Event</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminEventsPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminEventsContent />
    </ProtectedRoute>
  );
}
