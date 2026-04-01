"use client";

import { useEffect, useState } from "react";
import { Plus, Music, Video, BookOpen, Headphones } from "lucide-react";
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
  });
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
      setFormData({ title: "", speaker: "", url: "", description: "" });
      success("Resource created successfully");
    } catch (err) {
      error("Failed to create resource");
      console.error(err);
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
              <td className="px-4 py-3">
                <button className="text-xs font-heading font-semibold text-purple-vivid hover:underline">Edit</button>
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
            renderResourceTable(libraryResources, ["speaker", "date"])
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
