"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, User, Calendar, Tag } from "lucide-react";
import { blog } from "@/lib/api";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author?: string;
  authorName?: string;
  createdAt: string;
  updatedAt?: string;
  category?: string;
  imageUrl?: string;
  tags?: string[];
  excerpt?: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);
        const data = await blog.getPost(slug);
        if (!data) {
          setNotFound(true);
          return;
        }
        setPost(data);
        // Load comments from the backend response if included
        if (data.comments && Array.isArray(data.comments)) {
          setComments(
            data.comments.map((c: any) => ({
              id: c.id,
              author: c.user?.profile
                ? `${c.user.profile.firstName || ''} ${c.user.profile.lastName || ''}`.trim()
                : 'Anonymous',
              content: c.content,
              createdAt: c.createdAt,
            }))
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch post";
        if (message.includes("404") || message.includes("not found")) {
          setNotFound(true);
        } else {
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    if (!isAuthenticated) {
      showError("Please sign in to comment");
      return;
    }

    try {
      setSubmittingComment(true);
      await blog.addBlogComment(post!.id, commentContent);
      success("Comment posted successfully!");
      setCommentContent("");
      // Reload comments
      try {
        // Note: This assumes there's a getComments endpoint, adjust if needed
        setComments((prev) => [
          ...prev,
          {
            id: `${Date.now()}`,
            author: "You",
            content: commentContent,
            createdAt: new Date().toISOString(),
          },
        ]);
      } catch {}
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[800px] px-4 py-8 sm:px-6 md:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-5 w-5 rounded bg-gray-border animate-pulse" />
            <div className="h-8 w-40 rounded bg-gray-border animate-pulse" />
          </div>
          <SkeletonGroup count={8} />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[800px] px-4 py-8 sm:px-6 md:px-8">
          <Link href="/blog" className="flex items-center gap-2 text-purple-vivid hover:underline mb-8">
            <ArrowLeft size={18} /> Back to Blog
          </Link>
          <div className="rounded-[8px] border border-gray-border bg-white p-12 text-center shadow-sm">
            <h1 className="font-heading text-2xl font-bold text-slate mb-2">
              Post Not Found
            </h1>
            <p className="font-body text-base text-gray-text mb-6">
              The blog post you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/blog">
              <Button variant="primary">Back to Blog</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[800px] px-4 py-8 sm:px-6 md:px-8">
          <Link href="/blog" className="flex items-center gap-2 text-purple-vivid hover:underline mb-8">
            <ArrowLeft size={18} /> Back to Blog
          </Link>
          <div className="rounded-[8px] border border-error/30 bg-error/10 p-8 text-center">
            <p className="font-body text-base text-error">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="bg-off-white min-h-screen">
      <div className="mx-auto max-w-[800px] px-4 py-8 sm:px-6 md:px-8">
        {/* Back link */}
        <Link href="/blog" className="flex items-center gap-2 text-purple-vivid hover:underline mb-8">
          <ArrowLeft size={18} /> Back to Blog
        </Link>

        {/* Featured image */}
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-80 object-cover rounded-[8px] mb-8"
          />
        ) : (
          <div className="w-full h-80 bg-purple-dark rounded-[8px] mb-8 flex items-center justify-center">
            <span className="font-body text-sm text-white/20">Featured Image</span>
          </div>
        )}

        {/* Post metadata */}
        <div className="mb-8">
          {post.category && (
            <span className="inline-block rounded-full bg-purple-light px-3 py-1 text-xs font-heading font-semibold text-purple mb-4">
              {post.category}
            </span>
          )}
          <h1 className="font-heading text-4xl font-bold text-slate mb-4">
            {post.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm font-body text-gray-text">
            {post.authorName && (
              <div className="flex items-center gap-2">
                <User size={14} />
                {post.authorName}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Post content */}
        <div className="prose prose-sm max-w-none mb-8 rounded-[8px] bg-white border border-gray-border p-8 shadow-sm">
          <div
            className="font-body text-base text-slate leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-purple-light px-3 py-1.5 text-xs font-heading font-semibold text-purple"
              >
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Comments section */}
        <div className="space-y-6">
          <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
            <h2 className="font-heading text-xl font-bold text-slate mb-6">
              Comments ({comments.length})
            </h2>

            {/* Comment form */}
            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="mb-8 pb-8 border-b border-gray-border">
                <div className="mb-3">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="w-full rounded-[4px] border border-gray-border bg-off-white px-4 py-3 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:outline-none resize-vertical"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!commentContent.trim() || submittingComment}
                  loading={submittingComment}
                >
                  Post Comment
                </Button>
              </form>
            ) : (
              <div className="mb-8 pb-8 border-b border-gray-border text-center">
                <p className="font-body text-sm text-gray-text mb-3">
                  Please sign in to comment
                </p>
                <Link href="/auth/login">
                  <Button variant="secondary">Sign In</Button>
                </Link>
              </div>
            )}

            {/* Comments list */}
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-[4px] bg-off-white p-4"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-heading text-sm font-semibold text-slate">
                        {comment.author}
                      </span>
                      <span className="font-body text-xs text-gray-text">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-body text-sm text-slate leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="font-body text-sm text-gray-text">
                  No comments yet. Be the first to comment!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
