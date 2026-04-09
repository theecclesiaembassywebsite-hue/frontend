"use client";

import { useEffect, useState } from "react";
import { Plus, Music, Video, BookOpen, Headphones, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { media, upload } from "@/lib/api";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

type ResourceTab = "audio" | "video" | "library" | "music";

function AdminResourcesContent() {
  const [activeTab, setActiveTab] = useState<ResourceTab>("audio");
  const [audioSermons, setAudioSermons] = useState<any[]>([]);
  const [videoMessages, setVideoMessages] = useState<any[]>([]);
  const [libraryResources, setLibraryResources] = useState<any[]>([]);
  const [musicTracks, setMusicTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    speaker: "",
    url: "",
    description: "",
    price: "",
    isFree: false,
  });
  const [editingResource, setEditingResource] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [audio, video, library, music] = await Promise.all([
          media.getAudioSermons(),
          media.getVideoMessages(),
          media.getLibrary(),
          media.getMusic(),
        ]);
        setAudioSermons(audio);
        setVideoMessages(video);
        setLibraryResources(library);
        setMusicTracks(music);
      } catch (err) {
        error("Failed to load resources");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [error]);

  const handleCreateResource = async () => {
    if (!formData.title || !formData.url) {
      error("Please fill in all required fields");
      return;
    }

    try {
      let newResource;
      switch (activeTab) {
        case "audio":
          newResource = await media.createAudioSermon({
            title: formData.title,
            speaker: formData.speaker || "Unknown",
            audioUrl: formData.url,
            description: formData.description,
          });
          setAudioSermons([newResource, ...audioSermons]);
          break;
        case "video":
          newResource = await media.createVideoMessage({
            title: formData.title,
            youtubeUrl: formData.url,
            description: formData.description,
          });
          setVideoMessages([newResource, ...videoMessages]);
          break;
        case "library":
          newResource = await media.createLibraryResource({
            title: formData.title,
            author: formData.speaker || "Unknown",
            fileUrl: formData.url,
            description: formData.description,
            type: "BOOK",
            isFree: formData.isFree,
            price: formData.isFree ? undefined : parseFloat(formData.price) || undefined,
          });
          setLibraryResources([newResource, ...libraryResources]);
          break;
        case "music":
          newResource = await media.createMusic({
            title: formData.title,
            audioUrl: formData.url,
            album: formData.speaker || undefined,
          });
          setMusicTracks([newResource, ...musicTracks]);
          break;
      }
      setShowCreateModal(false);
      setFormData({ title: "", speaker: "", url: "", description: "", price: "", isFree: false });
      success("Resource created successfully");
    } catch (err) {
      error("Failed to create resource");
      console.error(err);
    }
  };

  const openEditModal = (resource: any) => {
    setEditingResource(resource);
    switch (activeTab) {
      case "video":
        setEditFormData({
          title: resource.title || "",
          youtubeUrl: resource.youtubeUrl || "",
          series: resource.series || "",
          description: resource.description || "",
        });
        break;
      case "audio":
        setEditFormData({
          title: resource.title || "",
          speaker: resource.speaker || "",
          audioUrl: resource.audioUrl || "",
          description: resource.description || "",
        });
        break;
      case "library":
        setEditFormData({
          title: resource.title || "",
          author: resource.author || "",
          fileUrl: resource.fileUrl || "",
          type: resource.type || "BOOK",
          description: resource.description || "",
          price: resource.price?.toString() || "",
          isFree: resource.isFree ? "true" : "false",
        });
        break;
      case "music":
        setEditFormData({
          title: resource.title || "",
          audioUrl: resource.audioUrl || "",
          album: resource.album || "",
        });
        break;
    }
  };

  const handleUpdateResource = async () => {
    if (!editingResource) return;
    try {
      let updated: any;
      switch (activeTab) {
        case "video":
          updated = await media.updateVideoMessage(editingResource.id, editFormData);
          setVideoMessages(videoMessages.map((r) => (r.id === editingResource.id ? updated : r)));
          break;
        case "audio":
          updated = await media.updateAudioSermon(editingResource.id, editFormData);
          setAudioSermons(audioSermons.map((r) => (r.id === editingResource.id ? updated : r)));
          break;
        case "library":
          updated = await media.updateLibraryResource(editingResource.id, editFormData);
          setLibraryResources(libraryResources.map((r) => (r.id === editingResource.id ? updated : r)));
          break;
        case "music":
          updated = await media.updateMusicTrack(editingResource.id, editFormData);
          setMusicTracks(musicTracks.map((r) => (r.id === editingResource.id ? updated : r)));
          break;
      }
      setEditingResource(null);
      setEditFormData({});
      success("Resource updated successfully");
    } catch (err) {
      error("Failed to update resource");
      console.error(err);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!window.confirm("Are you sure you want to delete this resource? This action cannot be undone.")) {
      return;
    }
    setDeletingId(resourceId);
    try {
      switch (activeTab) {
        case "video":
          await media.deleteVideoMessage(resourceId);
          setVideoMessages(videoMessages.filter((r) => r.id !== resourceId));
          break;
        case "audio":
          await media.deleteAudioSermon(resourceId);
          setAudioSermons(audioSermons.filter((r) => r.id !== resourceId));
          break;
        case "library":
          await media.deleteLibraryResource(resourceId);
          setLibraryResources(libraryResources.filter((r) => r.id !== resourceId));
          break;
        case "music":
          await media.deleteMusicTrack(resourceId);
          setMusicTracks(musicTracks.filter((r) => r.id !== resourceId));
          break;
      }
      success("Resource deleted successfully");
    } catch (err) {
      error("Failed to delete resource");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="font-heading text-2xl font-bold text-slate mb-6">Media Resources</h1>
        <SkeletonGroup count={5} />
      </div>
    );
  }

  const renderResourceTable = (resources: any[], columns: string[]) => (
    <div className="overflow-x-auto rounded-[8px] border border-gray-border bg-white shadow-sm mb-8">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-gray-border bg-off-white">
            <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Title</th>
            {columns.includes("speaker") && <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Speaker/Artist</th>}
            {columns.includes("date") && <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Date Added</th>}
            <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-border">
          {resources.map((resource) => (
            <tr key={resource.id} className="hover:bg-off-white/50 transition-colors">
              <td className="px-4 py-3 font-heading text-sm font-semibold text-slate">{resource.title}</td>
              {columns.includes("speaker") && (
                <td className="px-4 py-3 font-body text-sm text-gray-text">{resource.speaker || resource.artist || "-"}</td>
              )}
              {columns.includes("date") && (
                <td className="px-4 py-3 font-body text-sm text-gray-text">
                  {new Date(resource.createdAt || Date.now()).toLocaleDateString()}
                </td>
              )}
              <td className="px-4 py-3 flex items-center gap-2">
                <button
                  className="text-xs font-heading font-semibold text-purple-vivid hover:underline"
                  onClick={() => openEditModal(resource)}
                >
                  Edit
                </button>
                <button
                  className="text-xs font-heading font-semibold text-red-600 hover:underline flex items-center gap-1"
                  onClick={() => handleDeleteResource(resource.id)}
                  disabled={deletingId === resource.id}
                >
                  <Trash2 size={12} />
                  {deletingId === resource.id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate">Media Resources</h1>
          <p className="text-body-small mt-1">Manage audio sermons, video messages, library resources, and music</p>
        </div>
        <Button variant="primary" className="text-xs py-2 px-4 min-w-0" onClick={() => setShowCreateModal(true)}>
          <Plus size={14} className="mr-1" /> Add Resource
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-border">
        {[
          { key: "audio", label: "Audio Sermons", icon: Headphones },
          { key: "video", label: "Video Messages", icon: Video },
          { key: "library", label: "Library", icon: BookOpen },
          { key: "music", label: "Music", icon: Music },
        ].map((tab) => {
          const Icon = tab.icon;
          const count =
            tab.key === "audio"
              ? audioSermons.length
              : tab.key === "video"
                ? videoMessages.length
                : tab.key === "library"
                  ? libraryResources.length
                  : musicTracks.length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as ResourceTab)}
              className={`px-4 py-3 font-heading text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? "text-purple border-purple"
                  : "text-gray-text border-transparent hover:text-slate"
              }`}
            >
              <Icon size={16} />
              {tab.label}
              <span className="text-[10px] bg-off-white px-2 py-0.5 rounded-full">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "audio" && (
        <div>
          <h2 className="font-heading text-lg font-bold text-slate mb-3">Audio Sermons</h2>
          {audioSermons.length === 0 ? (
            <div className="rounded-[8px] border border-gray-border bg-off-white p-8 text-center">
              <p className="font-body text-sm text-gray-text">No audio sermons yet</p>
            </div>
          ) : (
            renderResourceTable(audioSermons, ["speaker", "date"])
          )}
        </div>
      )}

      {activeTab === "video" && (
        <div>
          <h2 className="font-heading text-lg font-bold text-slate mb-3">Video Messages</h2>
          {videoMessages.length === 0 ? (
            <div className="rounded-[8px] border border-gray-border bg-off-white p-8 text-center">
              <p className="font-body text-sm text-gray-text">No video messages yet</p>
            </div>
          ) : (
            renderResourceTable(videoMessages, ["speaker", "date"])
          )}
        </div>
      )}

      {activeTab === "library" && (
        <div>
          <h2 className="font-heading text-lg font-bold text-slate mb-3">Library Resources</h2>
          {libraryResources.length === 0 ? (
            <div className="rounded-[8px] border border-gray-border bg-off-white p-8 text-center">
              <p className="font-body text-sm text-gray-text">No library resources yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[8px] border border-gray-border bg-white shadow-sm mb-8">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-border bg-off-white">
                    <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Title</th>
                    <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Author</th>
                    <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Price</th>
                    <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Date Added</th>
                    <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-border">
                  {libraryResources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-off-white/50 transition-colors">
                      <td className="px-4 py-3 font-heading text-sm font-semibold text-slate">{resource.title}</td>
                      <td className="px-4 py-3 font-body text-sm text-gray-text">{resource.author || "-"}</td>
                      <td className="px-4 py-3">
                        {resource.isFree ? (
                          <span className="rounded-full bg-success/10 text-success px-2 py-0.5 text-[11px] font-heading font-semibold">FREE</span>
                        ) : (
                          <span className="font-heading text-sm font-semibold text-slate">
                            {resource.price ? `₦${Number(resource.price).toLocaleString()}` : "No price set"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-gray-text">
                        {new Date(resource.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 flex items-center gap-2">
                        <button
                          className="text-xs font-heading font-semibold text-purple-vivid hover:underline"
                          onClick={() => openEditModal(resource)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-xs font-heading font-semibold text-red-600 hover:underline flex items-center gap-1"
                          onClick={() => handleDeleteResource(resource.id)}
                          disabled={deletingId === resource.id}
                        >
                          <Trash2 size={12} />
                          {deletingId === resource.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "music" && (
        <div>
          <h2 className="font-heading text-lg font-bold text-slate mb-3">Music Tracks</h2>
          {musicTracks.length === 0 ? (
            <div className="rounded-[8px] border border-gray-border bg-off-white p-8 text-center">
              <p className="font-body text-sm text-gray-text">No music tracks yet</p>
            </div>
          ) : (
            renderResourceTable(musicTracks, ["speaker"])
          )}
        </div>
      )}

      {/* Edit Resource Modal */}
      <Modal isOpen={!!editingResource} onClose={() => setEditingResource(null)} title="Edit Resource">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Title *</label>
            <input
              type="text"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="Resource title"
              value={editFormData.title || ""}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
            />
          </div>

          {activeTab === "video" && (
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">YouTube URL *</label>
              <input
                type="url"
                className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                placeholder="https://youtube.com/watch?v=..."
                value={editFormData.youtubeUrl || ""}
                onChange={(e) => setEditFormData({ ...editFormData, youtubeUrl: e.target.value })}
              />
            </div>
          )}

          {activeTab === "video" && (
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">Series</label>
              <input
                type="text"
                className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                placeholder="Series name"
                value={editFormData.series || ""}
                onChange={(e) => setEditFormData({ ...editFormData, series: e.target.value })}
              />
            </div>
          )}

          {activeTab === "audio" && (
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">Speaker</label>
              <input
                type="text"
                className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                placeholder="Speaker name"
                value={editFormData.speaker || ""}
                onChange={(e) => setEditFormData({ ...editFormData, speaker: e.target.value })}
              />
            </div>
          )}

          {activeTab === "audio" && (
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">Audio URL</label>
              <input
                type="url"
                className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                placeholder="https://..."
                value={editFormData.audioUrl || ""}
                onChange={(e) => setEditFormData({ ...editFormData, audioUrl: e.target.value })}
              />
            </div>
          )}

          {activeTab === "library" && (
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">Author</label>
              <input
                type="text"
                className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                placeholder="Author name"
                value={editFormData.author || ""}
                onChange={(e) => setEditFormData({ ...editFormData, author: e.target.value })}
              />
            </div>
          )}

          {activeTab === "library" && (
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">File URL</label>
              <input
                type="url"
                className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                placeholder="https://..."
                value={editFormData.fileUrl || ""}
                onChange={(e) => setEditFormData({ ...editFormData, fileUrl: e.target.value })}
              />
            </div>
          )}

          {activeTab === "music" && (
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">Audio URL</label>
              <input
                type="url"
                className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                placeholder="https://..."
                value={editFormData.audioUrl || ""}
                onChange={(e) => setEditFormData({ ...editFormData, audioUrl: e.target.value })}
              />
            </div>
          )}

          {activeTab === "music" && (
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">Album</label>
              <input
                type="text"
                className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                placeholder="Album name"
                value={editFormData.album || ""}
                onChange={(e) => setEditFormData({ ...editFormData, album: e.target.value })}
              />
            </div>
          )}

          {(activeTab === "audio" || activeTab === "video" || activeTab === "library") && (
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">Description</label>
              <textarea
                className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                placeholder="Add a description..."
                rows={3}
                value={editFormData.description || ""}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </div>
          )}

          {activeTab === "library" && (
            <>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edit-isFree"
                  checked={editFormData.isFree === "true"}
                  onChange={(e) => setEditFormData({ ...editFormData, isFree: e.target.checked ? "true" : "false", price: e.target.checked ? "" : editFormData.price })}
                  className="accent-purple-vivid h-4 w-4"
                />
                <label htmlFor="edit-isFree" className="text-sm font-heading font-semibold text-slate">
                  Free resource (no payment required)
                </label>
              </div>
              {editFormData.isFree !== "true" && (
                <div>
                  <label className="block text-sm font-heading font-semibold text-slate mb-1">Price (NGN)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                    placeholder="e.g., 2500"
                    value={editFormData.price || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                  />
                </div>
              )}
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="primary" className="flex-1" onClick={handleUpdateResource}>Save Changes</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setEditingResource(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Create Resource Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add New Resource">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Title *</label>
            <input
              type="text"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="Resource title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">
              {activeTab === "audio" ? "Speaker" : activeTab === "video" ? "Speaker (optional)" : activeTab === "library" ? "Author" : "Album (optional)"}
            </label>
            <input
              type="text"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder={activeTab === "audio" ? "Speaker name" : activeTab === "video" ? "Speaker name" : activeTab === "library" ? "Author name" : "Album name"}
              value={formData.speaker}
              onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">
              {activeTab === "video" ? "YouTube URL *" : "File Upload or URL *"}
            </label>
            {activeTab === "video" ? (
              <input
                type="url"
                className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            ) : (
              <div className="space-y-2">
                <input
                  type="file"
                  accept={activeTab === "audio" || activeTab === "music" ? "audio/*" : activeTab === "library" ? "application/pdf" : "*"}
                  className="w-full font-body text-sm text-gray-text file:mr-3 file:rounded-[4px] file:border-0 file:bg-purple file:px-3 file:py-1.5 file:text-xs file:font-heading file:font-semibold file:text-white file:cursor-pointer hover:file:bg-purple-hover"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const uploadFn = activeTab === "audio" ? upload.audio : activeTab === "library" ? upload.pdf : upload.music;
                      const { url } = await uploadFn(file);
                      setFormData({ ...formData, url });
                      success("File uploaded!");
                    } catch (err) {
                      error(err instanceof Error ? err.message : "Upload failed");
                    }
                  }}
                />
                <p className="text-[10px] text-gray-text">Or enter URL manually:</p>
                <input
                  type="url"
                  className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                  placeholder="https://..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
            )}
          </div>

          {(activeTab === "audio" || activeTab === "video" || activeTab === "library") && (
            <div>
              <label className="block text-sm font-heading font-semibold text-slate mb-1">Description</label>
              <textarea
                className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                placeholder="Add a description..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          )}

          {activeTab === "library" && (
            <>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="create-isFree"
                  checked={formData.isFree}
                  onChange={(e) => setFormData({ ...formData, isFree: e.target.checked, price: e.target.checked ? "" : formData.price })}
                  className="accent-purple-vivid h-4 w-4"
                />
                <label htmlFor="create-isFree" className="text-sm font-heading font-semibold text-slate">
                  Free resource (no payment required)
                </label>
              </div>
              {!formData.isFree && (
                <div>
                  <label className="block text-sm font-heading font-semibold text-slate mb-1">Price (NGN) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
                    placeholder="e.g., 2500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              )}
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="primary" className="flex-1" onClick={handleCreateResource}>Add Resource</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminResourcesPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminResourcesContent />
    </ProtectedRoute>
  );
}
