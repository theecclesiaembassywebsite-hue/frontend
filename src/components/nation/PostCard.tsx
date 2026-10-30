"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Flag, Trash2, User } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/lib/auth-context";
import { nation, type MentionRef } from "@/lib/api";
import { REACTIONS, reactionEmoji, type ReactionCounts, type ReactionType } from "@/lib/reactions";
import MentionInput, { activeMentions } from "./MentionInput";
import MentionText from "./MentionText";

const MODERATOR_ROLES = ["ADMIN", "SUPER_ADMIN", "MODERATOR"];

interface PostCardProps {
  id: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  reactions?: ReactionCounts;
  myReaction?: ReactionType | null;
  mentions?: MentionRef[];
  comments: number;
  createdAt: string;
  authorName?: string;
  authorSquad?: string;
  onDelete?: (postId: string) => void;
}

export default function PostCard({
  id,
  authorId,
  content,
  imageUrl,
  reactions: initialReactions = {},
  myReaction: initialMyReaction = null,
  mentions,
  comments,
  createdAt,
  authorName = "Member",
  authorSquad,
  onDelete,
}: PostCardProps) {
  const { success, error } = useToast();
  const { user } = useAuth();
  const [myReaction, setMyReaction] = useState<ReactionType | null>(initialMyReaction);
  const [reactions, setReactions] = useState<ReactionCounts>(initialReactions);
  const [trayOpen, setTrayOpen] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);
  const [commentCount, setCommentCount] = useState(comments);
  const [showComments, setShowComments] = useState(false);
  const [commentList, setCommentList] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [commentMentions, setCommentMentions] = useState<MentionRef[]>([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const canDelete = !!user && (user.id === authorId || MODERATOR_ROLES.includes(user.role));

  const timestamp = new Date(createdAt).toLocaleDateString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    if (!trayOpen) return;
    const close = (e: MouseEvent) => {
      if (!trayRef.current?.contains(e.target as Node)) setTrayOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [trayOpen]);

  const totalReactions = Object.values(reactions).reduce((a, b) => a + (b ?? 0), 0);

  async function react(type: ReactionType) {
    const prevMine = myReaction;
    const prevCounts = reactions;
    // Optimistic: same type clears it, a different type swaps it.
    const next = { ...reactions };
    if (prevMine) next[prevMine] = Math.max(0, (next[prevMine] ?? 0) - 1);
    if (prevMine !== type) next[type] = (next[type] ?? 0) + 1;
    setMyReaction(prevMine === type ? null : type);
    setReactions(next);
    setTrayOpen(false);
    try {
      const res = await nation.react(id, type);
      setMyReaction(res.myReaction);
      setReactions(res.reactions);
    } catch {
      setMyReaction(prevMine);
      setReactions(prevCounts);
      error("Failed to react to post");
    }
  }

  async function toggleComments() {
    const next = !showComments;
    setShowComments(next);
    if (next && commentList.length === 0) {
      try {
        setLoadingComments(true);
        const data = await nation.getComments(id);
        setCommentList(Array.isArray(data) ? data : []);
      } catch (err) {
        error("Failed to load comments");
      } finally {
        setLoadingComments(false);
      }
    }
  }

  async function submitComment() {
    if (!commentContent.trim()) return;

    try {
      setSubmittingComment(true);
      const newComment = await nation.addComment(
        id,
        commentContent,
        activeMentions(commentContent, commentMentions).map((m) => m.userId),
      );
      setCommentList((prev) => [newComment, ...prev]);
      setCommentCount((c) => c + 1);
      setCommentContent("");
      setCommentMentions([]);
    } catch (err) {
      error("Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  }

  async function flagPost() {
    try {
      await nation.flagPost(id, "Inappropriate content");
      success("Post flagged for review");
    } catch (err) {
      error("Failed to flag post");
    }
  }

  async function deletePost() {
    try {
      setDeleting(true);
      await nation.deleteOwnPost(id);
      onDelete?.(id);
      success("Post deleted");
    } catch (err) {
      error("Failed to delete post");
    } finally {
      setDeleting(false);
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
        <MentionText text={content} mentions={mentions} />
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
        <div ref={trayRef} className="relative">
          <button
            type="button"
            onClick={() => setTrayOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={trayOpen}
            aria-label={myReaction ? "Change your reaction" : "React to this post"}
            className={`flex items-center gap-1.5 text-sm font-heading font-semibold transition-colors ${
              myReaction ? "text-purple-vivid" : "text-gray-text hover:text-purple-vivid"
            }`}
          >
            {myReaction ? (
              <span className="text-base leading-none">{reactionEmoji(myReaction)}</span>
            ) : (
              <Heart size={16} />
            )}
            {totalReactions}
          </button>

          {trayOpen && (
            <div
              role="menu"
              className="absolute bottom-full left-0 z-20 mb-2 flex max-w-[calc(100vw-3rem)] flex-wrap gap-1 rounded-full border border-gray-border bg-white px-2 py-1.5 shadow-lg"
            >
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  type="button"
                  role="menuitemradio"
                  title={r.label}
                  aria-label={r.label}
                  aria-checked={myReaction === r.type}
                  onClick={() => react(r.type)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xl transition-transform hover:scale-125 ${
                    myReaction === r.type ? "bg-lavender" : ""
                  }`}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {totalReactions > 0 && (
          <span className="-ml-3 flex items-center gap-1 text-xs text-gray-text" aria-hidden="true">
            {REACTIONS.filter((r) => (reactions[r.type] ?? 0) > 0).map((r) => (
              <span key={r.type}>{r.emoji}</span>
            ))}
          </span>
        )}

        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 text-sm font-heading font-semibold text-gray-text hover:text-purple-vivid transition-colors"
        >
          <MessageCircle size={16} />
          {commentCount}
        </button>

        <button
          onClick={flagPost}
          className={canDelete ? "text-gray-text hover:text-warning transition-colors" : "ml-auto text-gray-text hover:text-warning transition-colors"}
        >
          <Flag size={14} />
        </button>

        {canDelete && (
          <button
            onClick={() => setConfirmingDelete(true)}
            disabled={deleting}
            className="ml-auto text-gray-text hover:text-error transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-3 space-y-3">
          {loadingComments ? (
            <p className="text-xs text-gray-text">Loading comments...</p>
          ) : commentList.length > 0 ? (
            <div className="space-y-2">
              {commentList.map((c) => (
                <div key={c.id} className="rounded-[8px] bg-off-white px-3 py-2">
                  <p className="font-heading text-xs font-bold text-slate">
                    {c.user?.profile?.firstName
                      ? `${c.user.profile.firstName} ${c.user.profile.lastName || ""}`.trim()
                      : "Member"}
                  </p>
                  <p className="font-body text-sm text-slate">
                    <MentionText text={c.content} mentions={c.mentions} />
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-text">No comments yet.</p>
          )}

          <div className="flex gap-2">
            <MentionInput
              value={commentContent}
              onValueChange={setCommentContent}
              mentions={commentMentions}
              onMentionsChange={setCommentMentions}
              onEnter={submitComment}
              maxLength={2000}
              placeholder="Write a comment... Type @ to tag someone"
              className="flex-1 rounded-full border border-gray-border bg-off-white px-4 py-2 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:outline-none focus:ring-2 focus:ring-purple-vivid/15 w-full"
            />
            <button
              onClick={submitComment}
              disabled={submittingComment || !commentContent.trim()}
              className="rounded-full bg-purple px-4 py-2 text-xs font-heading font-semibold text-white hover:bg-purple-hover transition-colors disabled:opacity-50"
            >
              {submittingComment ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title="Delete post?"
        description="Delete this post? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={deletePost}
      />
    </div>
  );
}
