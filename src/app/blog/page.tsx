"use client";

import { useState, useEffect } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import { blog } from "@/lib/api";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  HoverLift,
} from "@/components/ui/Motion";
import { Search, Calendar, User, ArrowRight } from "lucide-react";
import Link from "next/link";

type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: "Teaching" | "Devotional" | "Testimony" | "Update";
  imageUrl?: string;
  slug: string;
};

type Category = "All" | "Teaching" | "Devotional" | "Testimony" | "Update";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const categories: Category[] = [
    "All",
    "Teaching",
    "Devotional",
    "Testimony",
    "Update",
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await blog.getPosts();
        setPosts(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load blog posts"
        );
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === "All" || post.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main>
      {/* Hero Section */}
      <section
        className="relative h-96 flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1920&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <FadeIn className="relative z-10 text-center px-4 max-w-2xl">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-white mb-4">
            Blog & Insights
          </h1>
          <p className="font-body text-lg md:text-xl text-gray-100 mb-6">
            Thoughts, teachings, and testimonials
          </p>
          <div className="h-1 w-16 bg-gradient-to-r from-purple to-purple-vivid mx-auto"></div>
        </FadeIn>
      </section>

      {/* Content Section */}
      <SectionWrapper variant="white">
        <StaggerContainer>
          {/* Search Bar */}
          <StaggerItem>
            <div className="w-full max-w-md mx-auto mb-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-text w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search blog posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-off-white border border-lavender rounded-lg focus:outline-none focus:ring-2 focus:ring-purple transition-all"
                />
              </div>
            </div>
          </StaggerItem>

          {/* Category Filter Chips */}
          <StaggerItem>
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full font-body font-medium transition-all ${
                    activeCategory === category
                      ? "bg-purple text-white shadow-md"
                      : "bg-off-white text-slate hover:bg-lavender"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </StaggerItem>

          {/* Loading State */}
          {loading && (
            <StaggerItem>
              <div className="mb-12">
                <SkeletonGroup count={3} variant="card" />
              </div>
            </StaggerItem>
          )}

          {/* Error State */}
          {error && !loading && (
            <StaggerItem>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-12">
                <p className="font-body text-red-700">
                  {error}. Please try again later.
                </p>
              </div>
            </StaggerItem>
          )}

          {/* Blog Cards Grid */}
          {!loading && filteredPosts.length > 0 && (
            <StaggerItem>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {filteredPosts.map((post) => (
                  <HoverLift
                    key={post.id}
                    className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
                  >
                    {/* Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-purple-dark to-purple relative overflow-hidden">
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : null}

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 bg-purple-vivid text-white text-xs px-3 py-1 rounded-full">
                        {post.category}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Date and Author Row */}
                      <div className="flex items-center gap-4 text-sm text-gray-text mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{post.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{post.author}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-heading text-lg font-bold text-slate mb-2 line-clamp-2">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="font-body text-gray-text text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>

                      {/* Read More Link */}
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 font-body font-medium text-purple hover:text-purple-vivid transition-colors group"
                      >
                        Read More
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </HoverLift>
                ))}
              </div>
            </StaggerItem>
          )}

          {/* Empty State */}
          {!loading && filteredPosts.length === 0 && !error && (
            <StaggerItem>
              <div className="text-center py-12">
                <p className="font-body text-gray-text text-lg mb-4">
                  No posts found matching your search.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  className="font-body font-medium text-purple hover:text-purple-vivid transition-colors"
                >
                  Clear filters and try again
                </button>
              </div>
            </StaggerItem>
          )}
        </StaggerContainer>
      </SectionWrapper>
    </main>
  );
}
