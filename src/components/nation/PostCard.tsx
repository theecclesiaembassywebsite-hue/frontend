"use client";

import { useState } from "react";
import { Heart, MessageCircle, Flag, User } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { nation } from "@/lib/api";

interface PostCardProps {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: string;
  liked?: boolean;
  authorName?: string;
  authorSquad?: string;
  onLike?: (postId: string) => void;
}

export default function PostCard({
  id,
  content,
  imageUrl,
  likes: initialLikes,
  comments,
  createdAt,
  liked: initialLiked = false,
  authorName = "Member",
  authorSquad,
  onLike,
}: PostCardProps) {
  const { error } = useToast();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const timestamp = new Date(createdAt).toLocaleDateString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  async function toggleLike() {
    try {
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
      await nation.likePost(id);
      onLike?.(id);
    } catch (err) {
      setLiked(!liked);
      setLikeCount(liked ? likeCount + 1 : likeCount - 1);
      error("Failed to like post");
    }
  }

  async function submitComment() {
    if (!commentContent.trim()) return;

    try {
      setSubmittingComment(true);
      await nation.addComment(id, commentContent);
      setCommentContent("");
    } catch (err) {
      error("Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  }

  async function flagPost() {
    try {
      await nation.flagPost(id, "Inappropriate content");
      error("Post flagged for review");
    } catch (err) {
      error("Failed to flag post");
    }
  }

  return (
    <div className="rounded-[8px] bg-white border border-gray-border p-5 shadow-sm">
      {/* Author header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-light">
          <User className="h-5 w-5 text-purple/50" />
        </div>
        <div className="min-w-0">
          <p className="font-heading text-sm font-bold text-slate truncate">
            {authorName}
          </p>
          <div className="flex items-center gap-2">
            {authorSquad && (
              <span className="text-[11px] font-heading font-semibold text-purple-vivid">
                {authorSquad}
              </span>
            )}
            <span className="text-[11px] font-body text-gray-text">{timestamp}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="mt-3 font-body text-sm text-slate leading-relaxed whitespace-pre-wrap">
        {content}
      </p>

      {/* Image */}
      {imageUrl && (
        <div className="mt-3 overflow-hidden rounded-[8px]">
          <div
            className="aspect-video bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-6 border-t border-gray-border pt-3">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 text-sm font-heading font-semibold transition-colors ${
            liked ? "text-error" : "text-gray-text hover:text-error"
          }`}
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
          {likeCount}
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm font-heading font-semibold text-gray-text hover:text-purple-vivid transition-colors"
        >
          <MessageCircle size={16} />
          {comments}
        </button>

        <button
          onClick={flagPost}
          className="ml-auto text-gray-text hover:text-warning transition-colors"
        >
          <Flag size={14} />
        </button>
      </div>

      {/* Comment input */}
      {showComments && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 rounded-full border border-gray-border bg-off-white px-4 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:outline-none focus:ring-2 focus:ring-purple-vivid/15"
          />
          <button
            onClick={submitComment}
            disabled={submittingComment || !commentContent.trim()}
            className="rounded-full bg-purple px-4 py-2 text-xs font-heading font-semibold text-white hover:bg-purple-hover transition-colors disabled:opacity-50"
          >
            {submittingComment ? "Posting..." : "Post"}
          </button>
        </div>
      )}
    </div>
  );
}
