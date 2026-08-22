"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { Search, Plus, Trash2, BookOpen, Pencil, Eye } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { blog, announcements } from "@/lib/api";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

const CATEGORIES = ["Teaching", "Devotional", "Testimony", "Update"];

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

type ContentItem = {
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  category?: string;
  imageUrl?: string;
  slug?: string;
  type: "BLOG" | "ANNOUNCEMENT";
  status: "PUBLISHED" | "DRAFT";
  published?: boolean;
  createdAt?: string;
};

type BlogFormData = {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  imageUrl: string;
};

type AnnouncementFormData = {
  title: string;
  content: string;
};

function AdminContentContent() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState("ANNOUNCEMENT");
  const [blogForm, setBlogForm] = useState<BlogFormData>({ title: "", content: "", excerpt: "", category: "Teaching", imageUrl: "" });
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementFormData>({ title: "", content: "" });

  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [editBlogForm, setEditBlogForm] = useState<BlogFormData>({ title: "", content: "", excerpt: "", category: "Teaching", imageUrl: "" });
  const [editAnnouncementForm, setEditAnnouncementForm] = useState<AnnouncementFormData>({ title: "", content: "" });

  const { success, error } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [blogPosts, announcementsList] = await Promise.all([
          blog.getPosts(50, 0),
          announcements.getAll(),
        ]);

        const items: ContentItem[] = [
          ...blogPosts.map((p: any) => ({
            ...p,
            type: "BLOG" as const,
            status: (p.status || "PUBLISHED") as "PUBLISHED" | "DRAFT",
          })),
          ...announcementsList.map((a: any) => ({
            ...a,
            type: "ANNOUNCEMENT" as const,
            status: (a.published ? "PUBLISHED" : "DRAFT") as "PUBLISHED" | "DRAFT",
          })),
        ];
        setContentItems(items);
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
    setFilteredContent(
      contentItems.filter((c) => {
        const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
        const matchesType = !typeFilter || c.type === typeFilter;
        const matchesStatus = !statusFilter || c.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
      })
    );
  }, [search, typeFilter, statusFilter, contentItems]);

  // ── Create ──────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    try {
      if (createType === "ANNOUNCEMENT") {
        if (!announcementForm.title || !announcementForm.content) {
          error("Please fill in title and content");
          return;
        }
        const newItem = await announcements.createAnnouncement(announcementForm);
        setContentItems([{ ...newItem, type: "ANNOUNCEMENT", status: "PUBLISHED" }, ...contentItems]);
      } else {
        if (!blogForm.title || !blogForm.content) {
          error("Please fill in title and content");
          return;
        }
        const newItem = await blog.createBlogPost(blogForm);
        setContentItems([{ ...newItem, type: "BLOG", status: "PUBLISHED" }, ...contentItems]);
      }
      setShowCreateModal(false);
      setBlogForm({ title: "", content: "", excerpt: "", category: "Teaching", imageUrl: "" });
      setAnnouncementForm({ title: "", content: "" });
      success("Content created");
    } catch {
      error("Failed to create content");
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────

  const openEdit = (item: ContentItem) => {
    setEditItem(item);
    if (item.type === "BLOG") {
      setEditBlogForm({
        title: item.title,
        content: item.content || "",
        excerpt: item.excerpt || "",
        category: item.category || "Teaching",
        imageUrl: item.imageUrl || "",
      });
    } else {
      setEditAnnouncementForm({ title: item.title, content: item.content || "" });
    }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    try {
      if (editItem.type === "BLOG") {
        const updated = await blog.updateBlogPost(editItem.id, editBlogForm);
        setContentItems(contentItems.map((c) => c.id === editItem.id ? { ...c, ...updated, type: "BLOG" } : c));
      } else {
        const updated = await announcements.updateAnnouncement(editItem.id, editAnnouncementForm);
        setContentItems(contentItems.map((c) => c.id === editItem.id ? { ...c, ...updated, type: "ANNOUNCEMENT" } : c));
      }
      setEditItem(null);
      success("Content updated");
    } catch {
      error("Failed to update content");
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async (item: ContentItem) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      if (item.type === "BLOG") {
        await blog.deleteBlogPost(item.id);
      } else {
        await announcements.deleteAnnouncement(item.id);
      }
      setContentItems(contentItems.filter((c) => c.id !== item.id));
      success("Content deleted");
    } catch {
      error("Failed to delete content");
    }
  };

  // ── Publish ──────────────────────────────────────────────────────────────────

  const handlePublish = async (item: ContentItem) => {
    try {
      if (item.type === "BLOG") {
        await blog.publishPost(item.id);
        setContentItems(contentItems.map((c) => c.id === item.id ? { ...c, status: "PUBLISHED" } : c));
        success("Blog post published");
      } else {
        await announcements.updateAnnouncement(item.id, { published: true });
        setContentItems(contentItems.map((c) => c.id === item.id ? { ...c, status: "PUBLISHED", published: true } : c));
        success("Announcement published");
      }
    } catch {
      error("Failed to publish");
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
          <p className="text-body-small mt-1">Manage announcements and blog posts</p>
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
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-border bg-off-white">
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Title</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Type</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Category</th>
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
                    <BookOpen size={14} className="text-purple/50 shrink-0" />
                    <span className="font-heading text-sm font-semibold text-slate line-clamp-1">{c.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-heading font-semibold ${typeBadge[c.type]}`}>
                    {c.type === "ANNOUNCEMENT" ? "Announcement" : "Blog Post"}
                  </span>
                </td>
                <td className="px-4 py-3 font-body text-sm text-gray-text">
                  {c.type === "BLOG" ? (c.category || "—") : "—"}
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
                  <div className="flex items-center gap-1">
                    {c.status === "DRAFT" && (
                      <button
                        className="rounded-[4px] p-1.5 text-success hover:bg-success/10 transition-colors"
                        title="Publish"
                        onClick={() => handlePublish(c)}
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    {c.type === "BLOG" && c.slug && (
                      <a
                        href={`/blog/${c.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-[4px] p-1.5 text-purple hover:bg-purple/10 transition-colors"
                        title="View post"
                      >
                        <Eye size={14} />
                      </a>
                    )}
                    <button
                      className="rounded-[4px] p-1.5 text-slate hover:bg-slate/10 transition-colors"
                      title="Edit"
                      onClick={() => openEdit(c)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="rounded-[4px] p-1.5 text-error hover:bg-error/10 transition-colors"
                      title="Delete"
                      onClick={() => handleDelete(c)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredContent.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center font-body text-sm text-gray-text">
                  No content found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-body-small">{filteredContent.length} item{filteredContent.length !== 1 ? "s" : ""}</p>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Content" size="xl">
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

          {createType === "BLOG" ? (
            <>
              <Field label="Title">
                <input className={inputCls} placeholder="Post title" value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} />
              </Field>
              <Field label="Category">
                <select className={inputCls} value={blogForm.category} onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Excerpt">
                <textarea className={inputCls} rows={2} placeholder="Short summary shown in listing" value={blogForm.excerpt} onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })} />
              </Field>
              <Field label="Image URL (optional)">
                <input className={inputCls} placeholder="https://..." value={blogForm.imageUrl} onChange={(e) => setBlogForm({ ...blogForm, imageUrl: e.target.value })} />
              </Field>
              <Field label="Content">
                <textarea className={inputCls} rows={8} placeholder="Write your post here..." value={blogForm.content} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} />
              </Field>
            </>
          ) : (
            <>
              <Field label="Title">
                <input className={inputCls} placeholder="Announcement title" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} />
              </Field>
              <Field label="Content">
                <textarea className={inputCls} rows={5} placeholder="Announcement body..." value={announcementForm.content} onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })} />
              </Field>
            </>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="primary" className="flex-1" onClick={handleCreate}>Create</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title={`Edit ${editItem?.type === "BLOG" ? "Blog Post" : "Announcement"}`} size="xl">
        {editItem && (
          <div className="space-y-4">
            {editItem.type === "BLOG" ? (
              <>
                <Field label="Title">
                  <input className={inputCls} value={editBlogForm.title} onChange={(e) => setEditBlogForm({ ...editBlogForm, title: e.target.value })} />
                </Field>
                <Field label="Category">
                  <select className={inputCls} value={editBlogForm.category} onChange={(e) => setEditBlogForm({ ...editBlogForm, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Excerpt">
                  <textarea className={inputCls} rows={2} value={editBlogForm.excerpt} onChange={(e) => setEditBlogForm({ ...editBlogForm, excerpt: e.target.value })} />
                </Field>
                <Field label="Image URL">
                  <input className={inputCls} placeholder="https://..." value={editBlogForm.imageUrl} onChange={(e) => setEditBlogForm({ ...editBlogForm, imageUrl: e.target.value })} />
                </Field>
                <Field label="Content">
                  <textarea className={inputCls} rows={10} value={editBlogForm.content} onChange={(e) => setEditBlogForm({ ...editBlogForm, content: e.target.value })} />
                </Field>
              </>
            ) : (
              <>
                <Field label="Title">
                  <input className={inputCls} value={editAnnouncementForm.title} onChange={(e) => setEditAnnouncementForm({ ...editAnnouncementForm, title: e.target.value })} />
                </Field>
                <Field label="Content">
                  <textarea className={inputCls} rows={6} value={editAnnouncementForm.content} onChange={(e) => setEditAnnouncementForm({ ...editAnnouncementForm, content: e.target.value })} />
                </Field>
              </>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="primary" className="flex-1" onClick={handleEdit}>Save Changes</Button>
              <Button variant="secondary" className="flex-1" onClick={() => setEditItem(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-heading font-semibold text-slate mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none";

export default function AdminContentPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminContentContent />
    </ProtectedRoute>
  );
}
