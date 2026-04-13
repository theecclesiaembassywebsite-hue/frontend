"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { Search, Plus, Calendar, Users, MapPin, Clock, Pencil, ImagePlus, X } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { events as eventsAPI, upload } from "@/lib/api";
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

function deriveStatus(dateStr: string): string {
  if (!dateStr) return "UPCOMING";
  const eventDate = new Date(dateStr);
  const now = new Date();
  if (eventDate.toDateString() === now.toDateString()) return "ONGOING";
  return eventDate < now ? "COMPLETED" : "UPCOMING";
}

function AdminEventsContent() {
  const [eventList, setEventList] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingEvent, setViewingEvent] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    maxCapacity: "",
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "8:00 AM",
    location: "",
    capacity: "",
    eventType: "GENERAL",
  });
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
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
      const matchesStatus = !statusFilter || deriveStatus(e.date) === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredEvents(filtered);
  }, [search, statusFilter, eventList]);

  const handleImageSelect = (file: File, mode: "create" | "edit") => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (mode === "create") {
        setCreateImageFile(file);
        setCreateImagePreview(reader.result as string);
      } else {
        setEditImageFile(file);
        setEditImagePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateEvent = async () => {
    if (!formData.title || !formData.date || !formData.location) {
      error("Please fill in all required fields");
      return;
    }

    try {
      let imageUrl: string | undefined;
      if (createImageFile) {
        setUploadingImage(true);
        try {
          const uploadRes = await upload.image(createImageFile);
          imageUrl = uploadRes.url;
        } catch {
          error("Image upload failed, creating event without image");
        } finally {
          setUploadingImage(false);
        }
      }

      const newEvent = await eventsAPI.createEvent({
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        maxCapacity: parseInt(formData.capacity) || 100,
        eventType: formData.eventType,
        ...(imageUrl ? { imageUrl } : {}),
      });
      setEventList([newEvent, ...eventList]);
      setShowCreateModal(false);
      setFormData({ title: "", description: "", date: "", time: "8:00 AM", location: "", capacity: "", eventType: "GENERAL" });
      setCreateImageFile(null);
      setCreateImagePreview(null);
      success("Event created successfully");
    } catch (err) {
      error("Failed to create event");
      console.error(err);
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;
    try {
      let imageUrl: string | undefined;
      if (editImageFile) {
        setUploadingImage(true);
        try {
          const uploadRes = await upload.image(editImageFile);
          imageUrl = uploadRes.url;
        } catch {
          error("Image upload failed");
        } finally {
          setUploadingImage(false);
        }
      }

      const updated = await eventsAPI.updateEvent(editingEvent.id, {
        title: editFormData.title,
        description: editFormData.description,
        date: editFormData.date,
        time: editFormData.time,
        location: editFormData.location,
        maxCapacity: parseInt(editFormData.maxCapacity) || undefined,
        ...(imageUrl ? { imageUrl } : {}),
      });
      setEventList(eventList.map((e) => (e.id === editingEvent.id ? { ...e, ...updated } : e)));
      setEditingEvent(null);
      setEditImageFile(null);
      setEditImagePreview(null);
      success("Event updated successfully");
    } catch (err) {
      error("Failed to update event");
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

  const totalRegistrations = eventList.reduce((s, e) => s + (e._count?.registrations || 0), 0);
  const upcomingCount = eventList.filter((e) => deriveStatus(e.date) === "UPCOMING").length;

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
          <p className="font-heading text-xl font-bold text-warning">{eventList.filter((e) => deriveStatus(e.date) === "ONGOING").length}</p>
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
              const registered = e._count?.registrations || 0;
              const capacity = e.maxCapacity || 100;
              const status = deriveStatus(e.date);
              const fillPercent = Math.round((registered / capacity) * 100);
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
                      <span className="font-heading text-xs font-semibold text-slate">{registered}/{capacity}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-heading font-semibold ${statusBadge[status] || "bg-slate/10 text-slate"}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-[4px] p-1.5 text-purple-vivid hover:bg-purple/10 transition-colors"
                        title="Edit"
                        onClick={() => {
                          setEditingEvent(e);
                          setEditFormData({
                            title: e.title || "",
                            description: e.description || "",
                            date: e.date ? e.date.split("T")[0] : "",
                            time: e.time || "",
                            location: e.location || "",
                            maxCapacity: e.maxCapacity ? String(e.maxCapacity) : "",
                          });
                          setEditImageFile(null);
                          setEditImagePreview(e.imageUrl || null);
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="text-xs font-heading font-semibold text-purple-vivid hover:underline"
                        onClick={() => setViewingEvent(e)}
                      >View</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-body-small">{filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}</p>

      {/* View Event Modal */}
      <Modal isOpen={!!viewingEvent} onClose={() => setViewingEvent(null)} title="Event Details">
        {viewingEvent && (
          <div className="space-y-4">
            {viewingEvent.imageUrl && (
              <div className="rounded-[8px] overflow-hidden border border-gray-border">
                <img src={viewingEvent.imageUrl} alt={viewingEvent.title} className="w-full h-48 object-cover" />
              </div>
            )}
            <div>
              <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Title</p>
              <p className="font-body text-sm text-slate">{viewingEvent.title}</p>
            </div>
            <div>
              <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Description</p>
              <p className="font-body text-sm text-slate">{viewingEvent.description || "No description"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Date</p>
                <p className="font-body text-sm text-slate">{viewingEvent.date ? new Date(viewingEvent.date).toLocaleDateString() : "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Time</p>
                <p className="font-body text-sm text-slate">{viewingEvent.time || "N/A"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Location</p>
              <p className="font-body text-sm text-slate">{viewingEvent.location || "N/A"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Registrations</p>
                <p className="font-body text-sm text-slate">{viewingEvent._count?.registrations || 0} / {viewingEvent.maxCapacity || 100}</p>
              </div>
              <div>
                <p className="text-xs font-heading font-semibold text-gray-text uppercase tracking-wider mb-1">Status</p>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-heading font-semibold ${statusBadge[deriveStatus(viewingEvent.date)] || "bg-slate/10 text-slate"}`}>
                  {deriveStatus(viewingEvent.date)}
                </span>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setViewingEvent(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Event Modal */}
      <Modal isOpen={!!editingEvent} onClose={() => setEditingEvent(null)} title="Edit Event">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Event Title</label>
            <input
              type="text"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="e.g., Easter Celebration"
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Description</label>
            <textarea
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="Event details..."
              rows={3}
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Date</label>
            <input
              type="date"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              value={editFormData.date}
              onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Time</label>
            <input
              type="text"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="e.g., 9:00 AM"
              value={editFormData.time}
              onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Location</label>
            <input
              type="text"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="e.g., Main Auditorium"
              value={editFormData.location}
              onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Capacity</label>
            <input
              type="number"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="e.g., 200"
              value={editFormData.maxCapacity}
              onChange={(e) => setEditFormData({ ...editFormData, maxCapacity: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Event Image</label>
            {editImagePreview ? (
              <div className="relative rounded-[8px] overflow-hidden border border-gray-border">
                <img src={editImagePreview} alt="Preview" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 transition-colors"
                  onClick={() => { setEditImageFile(null); setEditImagePreview(null); }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 rounded-[8px] border-2 border-dashed border-gray-border bg-off-white cursor-pointer hover:border-purple-vivid/40 transition-colors">
                <ImagePlus size={24} className="text-gray-text mb-2" />
                <span className="text-xs font-body text-gray-text">Click to upload event image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageSelect(file, "edit");
                  }}
                />
              </label>
            )}
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="primary" className="flex-1" onClick={handleUpdateEvent} disabled={uploadingImage}>
              {uploadingImage ? "Uploading..." : "Save Changes"}
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => setEditingEvent(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

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
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Time</label>
            <input
              type="text"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="e.g., 9:00 AM"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Event Type</label>
            <select
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
            >
              <option value="GENERAL">General</option>
              <option value="FEAST_OF_TABERNACLES">Feast of Tabernacles</option>
              <option value="GILGAL_CAMP_MEETING">Gilgal Camp Meeting</option>
              <option value="AS_UNTO_THE_LORD">As Unto The Lord</option>
            </select>
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
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Event Image</label>
            {createImagePreview ? (
              <div className="relative rounded-[8px] overflow-hidden border border-gray-border">
                <img src={createImagePreview} alt="Preview" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 transition-colors"
                  onClick={() => { setCreateImageFile(null); setCreateImagePreview(null); }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 rounded-[8px] border-2 border-dashed border-gray-border bg-off-white cursor-pointer hover:border-purple-vivid/40 transition-colors">
                <ImagePlus size={24} className="text-gray-text mb-2" />
                <span className="text-xs font-body text-gray-text">Click to upload event image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageSelect(file, "create");
                  }}
                />
              </label>
            )}
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="primary" className="flex-1" onClick={handleCreateEvent} disabled={uploadingImage}>
              {uploadingImage ? "Uploading..." : "Create Event"}
            </Button>
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
