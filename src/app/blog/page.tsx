"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Calendar, User } from "lucide-react";
import { blog } from "@/lib/api";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

const categories = ["All", "Devotional", "Teaching", "Testimony", "Announcement"];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await blog.getPosts(100, 0);
        setPosts(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch posts");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filtered = posts.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "All" || (p.category === selectedCategory);
    return matchesSearch && matchesCat;
  });

  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            Blog
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            Articles, devotionals, and thought pieces
          </h6>
        </div>
      </section>

      {/* Search & Filter */}
      <SectionWrapper variant="off-white" className="!py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Input
              id="search"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-text pointer-events-none"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-heading font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-purple text-white"
                    : "bg-white text-gray-text border border-gray-border hover:border-purple-vivid"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Blog Grid */}
      <SectionWrapper variant="white" className="!pt-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {loading ? (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col overflow-hidden rounded-[8px] border border-gray-border bg-white"
                >
                  <Skeleton variant="card" className="h-40" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </>
          ) : error ? (
            <div className="col-span-full py-12 text-center">
              <p className="font-body text-base text-error">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <p className="font-body text-base text-gray-text">
                No articles found.
              </p>
            </div>
          ) : (
            filtered.map((post) => (
              <Link
                key={post.id || post.slug}
                href={`/blog/${post.slug || post.id}`}
                className="group flex flex-col overflow-hidden rounded-[8px] border border-gray-border bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Featured image placeholder 3:2 */}
                <div className="aspect-[3/2] bg-purple-dark flex items-center justify-center">
                  <span className="font-body text-sm text-white/20">
                    Featured Image
                  </span>
                </div>

                <div className="flex flex-col flex-1 p-5">
                  <span className="inline-block self-start rounded-full bg-purple-light px-2.5 py-0.5 text-[11px] font-heading font-semibold text-purple">
                    {post.category || "Article"}
                  </span>
                  <h3 className="mt-2 font-heading text-lg font-bold text-slate group-hover:text-purple-vivid transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-2 font-body text-sm text-gray-text leading-relaxed line-clamp-3 flex-1">
                    {post.excerpt || post.content?.substring(0, 150)}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-body-small">
                    <span className="flex items-center gap-1">
                      <User size={12} /> {post.author || "The Ecclesia Embassy"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />{" "}
                      {new Date(post.createdAt || post.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </SectionWrapper>
    </>
  );
}
