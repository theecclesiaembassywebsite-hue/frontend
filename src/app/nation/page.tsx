"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Users, User } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { nation, engagement, type Post } from "@/lib/api";
import CreatePost from "@/components/nation/CreatePost";
import PostCard from "@/components/nation/PostCard";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

export default function NationPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadFeed();
    loadGroups();
    loadStreak();
  }, [page]);

  async function loadFeed() {
    try {
      setLoading(true);
      const feed = await nation.getFeed(page + 1);
      setPosts(feed);
    } catch (err) {
      error("Failed to load feed");
    } finally {
      setLoading(false);
    }
  }

  async function loadGroups() {
    try {
      const groupsData = await nation.getGroups();
      setGroups(groupsData.slice(0, 4));
    } catch (err) {
      console.error("Failed to load groups");
    }
  }

  async function loadStreak() {
    try {
      const streakData = await engagement.getStreak();
      setStreak(streakData.currentStreak);
    } catch (err) {
      console.error("Failed to load streak");
    }
  }

  async function handleCreatePost(content: string) {
    try {
      await nation.createPost({ content });
      success("Post created successfully!");
      setPosts([]);
      setPage(0);
      loadFeed();
    } catch (err) {
      error("Failed to create post");
    }
  }

  async function handleLikePost(postId: string) {
    try {
      await nation.likePost(postId);
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    } catch (err) {
      error("Failed to like post");
    }
  }

  return (
    <ProtectedRoute>
      <>
        {/* Hero */}
        <section className="relative flex items-center justify-center py-16 md:py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
          <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
          <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
            <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
              Ecclesia Nation
            </h1>
            <h6 className="mt-2 font-serif text-base font-light text-off-white">
              Connect, share, and grow with the community
            </h6>
          </div>
        </section>

        <div className="bg-lavender min-h-screen">
          <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:px-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {/* Sidebar */}
              <aside className="hidden lg:block space-y-4">
                <div className="rounded-[8px] bg-white border border-gray-border p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-light">
                      <User className="h-6 w-6 text-purple/50" />
                    </div>
                    <div>
                      <p className="font-heading text-sm font-bold text-slate">
                        {user?.profile.firstName || "Member"}
                      </p>
                      <p className="text-[11px] text-gray-text">View Profile</p>
                    </div>
                  </div>
                  <nav className="space-y-1">
                    <Link
                      href="/nation/messages"
                      className="flex items-center gap-2 rounded-[4px] px-3 py-2 font-body text-sm text-slate hover:bg-lavender transition-colors"
                    >
                      <MessageCircle size={16} /> Messages
                    </Link>
                    <Link
                      href="/nation/groups"
                      className="flex items-center gap-2 rounded-[4px] px-3 py-2 font-body text-sm text-slate hover:bg-lavender transition-colors"
                    >
                      <Users size={16} /> Groups
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 rounded-[4px] px-3 py-2 font-body text-sm text-slate hover:bg-lavender transition-colors"
                    >
                      <User size={16} /> Dashboard
                    </Link>
                  </nav>
                </div>

                {/* Streak widget */}
                <div className="rounded-[8px] bg-white border border-gray-border p-4 shadow-sm text-center">
                  <p className="font-heading text-xs font-bold uppercase tracking-wider text-gray-text">
                    Watch Streak
                  </p>
                  <p className="mt-1 font-heading text-3xl font-bold text-purple">
                    {streak}
                  </p>
                  <p className="text-[11px] text-gray-text">days in a row</p>
                </div>
              </aside>

              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-4">
                <CreatePost onSubmit={handleCreatePost} />
                {loading ? (
                  <SkeletonGroup count={3} variant="card" />
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      {...post}
                      onLike={() => handleLikePost(post.id)}
                    />
                  ))
                )}
              </div>

              {/* Right sidebar */}
              <aside className="hidden lg:block space-y-4">
                {/* Trending / Active Groups */}
                <div className="rounded-[8px] bg-white border border-gray-border p-4 shadow-sm">
                  <h4 className="font-heading text-sm font-bold text-slate mb-3">
                    Active Groups
                  </h4>
                  <div className="space-y-2">
                    {groups.map((group) => (
                      <Link
                        key={group.id}
                        href="/nation/groups"
                        className="block rounded-[4px] px-3 py-2 font-body text-sm text-slate hover:bg-lavender transition-colors"
                      >
                        {group.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Upcoming */}
                <div className="rounded-[8px] bg-white border border-gray-border p-4 shadow-sm">
                  <h4 className="font-heading text-sm font-bold text-slate mb-3">
                    Upcoming
                  </h4>
                  <div className="space-y-2 text-sm font-body text-gray-text">
                    <p>Sunday — Word &amp; Life Service</p>
                    <p>Tuesday — Prayer &amp; Intercession</p>
                    <p>Friday — Worship Encounter</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </>
    </ProtectedRoute>
  );
}
