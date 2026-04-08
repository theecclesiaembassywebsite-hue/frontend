"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { Search, Plus, Trash2, BookOpen } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { blog, announcements } from "@/lib/api";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "ANNOUNCEMENT", label: "Announcement" },
  { value: "BLOG", label: "Blog Post" },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
];

const typeBadge: Record<string, string> = {
  ANNOUNCEMENT: "bg-purple/10 text-purple",
  BLOG: "bg-purple-vivid/10 text-purple-vivid",
};

const statusBadge: Record<string, string> = {
  PUBLISHED: "bg-success/10 text-success",
  DRAFT: "bg-warning/10 text-warning",
};

function AdminContentContent() {
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [filteredContent, setFilteredContent] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState("ANNOUNCEMENT");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const { success, error } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [blogPosts, announcementsList] = await Promise.all([
          blog.getPosts(50, 0),
          announcements.getAll(),
        ]);

        const items = [
          ...blogPosts.map((p: any) => ({ ...p, type: "BLOG", status: p.status || "PUBLISHED" })),
          ...announcementsList.map((a: any) => ({ ...a, type: "ANNOUNCEMENT", status: a.published ? "PUBLISHED" : "DRAFT" })),
        ];
        setContentItems(items);
        setFilteredContent(items);
      } catch (err) {
        error("Failed to load content");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [error]);

  useEffect(() => {
    const filtered = contentItems.filter((c) => {
      const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
      const matchesType = !typeFilter || c.type === typeFilter;
      const matchesStatus = !statusFilter || c.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
    setFilteredContent(filtered);
  }, [search, typeFilter, statusFilter, contentItems]);

  const handleCreateContent = async () => {
    if (!formData.title || !formData.content) {
      error("Please fill in all required fields");
      return;
    }

    try {
      if (createType === "ANNOUNCEMENT") {
        const newItem = await announcements.createAnnouncement({
          title: formData.title,
          content: formData.content,
        });
        setContentItems([{ ...newItem, type: "ANNOUNCEMENT", status: "PUBLISHED" }, ...contentItems]);
      } else {
        const newItem = await blog.createBlogPost({
          title: formData.title,
          content: formData.content,
        });
        setContentItems([{ ...newItem, type: "BLOG", status: "PUBLISHED" }, ...contentItems]);
      }
      setShowCreateModal(false);
      setFormData({ title: "", content: "" });
      success("Content created successfully");
    } catch (err) {
      error("Failed to create content");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="font-heading text-2xl font-bold text-slate mb-6">Content Management</h1>
        <SkeletonGroup count={5} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate">Content Management</h1>
          <p className="text-body-small mt-1">Manage announcements, sermons, blog posts, and pages</p>
        </div>
        <Button variant="primary" className="text-xs py-2 px-4 min-w-0" onClick={() => setShowCreateModal(true)}>
          <Plus size={14} className="mr-1" /> New Content
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end mb-6">
        <div className="flex-1 relative">
          <Input id="search" placeholder="Search by title..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-text pointer-events-none" />
        </div>
        <div className="w-full md:w-44">
          <Select id="type" options={typeOptions} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} />
        </div>
        <div className="w-full md:w-44">
          <Select id="status" options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-[8px] border border-gray-border bg-white shadow-sm">
        <table className="w-full min-w-[750px]">
          <thead>
            <tr className="border-b border-gray-border bg-off-white">
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Title</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Type</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Status</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Date</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-border">
            {filteredContent.map((c) => (
              <tr key={c.id} className="hover:bg-off-white/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-purple/50" />
                    <span className="font-heading text-sm font-semibold text-slate">{c.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-heading font-semibold ${typeBadge[c.type]}`}>
                    {c.type === "ANNOUNCEMENT" ? "Announcement" : "Blog Post"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-heading font-semibold ${statusBadge[c.status]}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-body text-sm text-gray-text">
                  {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-[4px] p-1.5 text-error hover:bg-error/10 transition-colors"
                      title="Delete"
                      onClick={async () => {
                        if (c.type !== "ANNOUNCEMENT") return;
                        try {
                          await announcements.deleteAnnouncement(c.id);
                          setContentItems(contentItems.filter((item) => item.id !== c.id));
                          success("Content deleted");
                        } catch (err) {
                          error("Failed to delete content");
                        }
                      }}
                      disabled={c.type !== "ANNOUNCEMENT"}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-body-small">{filteredContent.length} item{filteredContent.length !== 1 ? "s" : ""}</p>

      {/* Create Content Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Content">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Content Type</label>
            <select
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              value={createType}
              onChange={(e) => setCreateType(e.target.value)}
            >
              <option value="ANNOUNCEMENT">Announcement</option>
              <option value="BLOG">Blog Post</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Title</label>
            <input
              type="text"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="Enter content title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-1">Content</label>
            <textarea
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="Write your content here..."
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="primary" className="flex-1" onClick={handleCreateContent}>Create Content</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminContentPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminContentContent />
    </ProtectedRoute>
  );
}
