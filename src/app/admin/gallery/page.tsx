"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { gallery, upload } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Trash2, Upload, ImagePlus } from "lucide-react";

function AdminGalleryContent() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const { success, error } = useToast();

  useEffect(() => {
    gallery.getImages()
      .then((data) => setImages(data || []))
      .catch(() => error("Failed to load gallery"))
      .finally(() => setLoading(false));
  }, [error]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await upload.image(file);
      const img = await gallery.addImage({ url, caption: caption.trim() || undefined, order: images.length });
      setImages([...images, img]);
      setCaption("");
      success("Photo uploaded");
    } catch {
      error("Failed to upload photo");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this photo?")) return;
    try {
      await gallery.deleteImage(id);
      setImages(images.filter((img) => img.id !== id));
      success("Photo deleted");
    } catch {
      error("Failed to delete photo");
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-slate">Experience Gallery</h1>
        <p className="text-body-small mt-1">Manage photos shown on the Ecclesia Experience page</p>
      </div>

      {/* Upload area */}
      <div className="mb-8 rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
        <h2 className="font-heading text-base font-bold text-slate mb-4">Upload New Photo</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex-1">
            <label className="mb-1 block font-heading text-xs font-semibold uppercase tracking-wider text-gray-text">
              Caption (optional)
            </label>
            <input
              type="text"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="e.g. Sunday Worship, June 2026"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <label className="mt-5 sm:mt-0 flex cursor-pointer items-center gap-2 rounded-[4px] bg-purple-vivid px-5 py-2.5 font-heading text-xs font-bold uppercase tracking-wider text-white hover:bg-purple transition-colors shrink-0">
            {uploading ? (
              <><Upload size={14} className="animate-spin" /> Uploading...</>
            ) : (
              <><ImagePlus size={14} /> Choose Photo</>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="aspect-square rounded-[8px] bg-gray-border animate-pulse" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-[8px] border border-dashed border-gray-border bg-off-white py-20 text-center">
          <ImagePlus className="mx-auto h-10 w-10 text-gray-text/40 mb-3" />
          <p className="font-body text-sm text-gray-text">No photos yet. Upload the first one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-[8px] bg-gray-border shadow-sm">
              <img loading="lazy" decoding="async" src={img.url} alt={img.caption || "Gallery photo"} className="h-full w-full object-cover" />
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1.5">
                  <p className="font-body text-[11px] text-white/90 line-clamp-1">{img.caption}</p>
                </div>
              )}
              <button
                onClick={() => handleDelete(img.id)}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-error"
                title="Delete photo"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-body-small">{images.length} photo{images.length !== 1 ? "s" : ""}</p>
    </div>
  );
}

export default function AdminGalleryPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER"]}>
      <AdminGalleryContent />
    </ProtectedRoute>
  );
}
