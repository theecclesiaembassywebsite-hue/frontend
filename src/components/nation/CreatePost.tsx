"use client";

import { useState, useRef } from "react";
import { Image, Send, User, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { upload } from "@/lib/api";

interface CreatePostProps {
  onSubmit: (content: string, imageUrl?: string) => Promise<void>;
}

export default function CreatePost({ onSubmit }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const { url } = await upload.image(file);
      setImageUrl(url);
    } catch {
      // silently fail
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      await onSubmit(content, imageUrl || undefined);
      setContent("");
      setImageUrl(null);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[8px] bg-white border border-gray-border p-5 shadow-sm"
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-light">
          <User className="h-5 w-5 text-purple/50" />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share an update, testimony, or encouragement..."
          maxLength={2000}
          rows={3}
          disabled={submitting}
          className="flex-1 resize-none rounded-[8px] border border-gray-border bg-off-white px-4 py-3 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:outline-none focus:ring-2 focus:ring-purple-vivid/15 disabled:opacity-50"
        />
      </div>

      {/* Image preview */}
      {imageUrl && (
        <div className="mt-3 relative inline-block">
          <img src={imageUrl} alt="Upload" className="h-24 rounded-[8px] object-cover" />
          <button type="button" onClick={() => setImageUrl(null)} className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-error text-white flex items-center justify-center">
            <X size={12} />
          </button>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <button
            type="button"
            disabled={submitting || uploading}
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 text-xs font-heading font-semibold text-gray-text hover:text-purple-vivid transition-colors disabled:opacity-50"
          >
            <Image size={16} /> {uploading ? "Uploading..." : "Photo"}
          </button>
          <span className="text-[11px] text-gray-text">
            {content.length}/2000
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="text-xs py-2 px-4 min-w-0"
          disabled={!content.trim() || submitting}
        >
          <Send size={14} className="mr-1" /> {submitting ? "Posting..." : "Post"}
        </Button>
      </div>

      {submitted && (
        <p className="mt-2 text-xs font-heading font-semibold text-success">
          Posted successfully!
        </p>
      )}
    </form>
  );
}
