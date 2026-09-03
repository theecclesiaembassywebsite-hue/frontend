import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { blog } from "@/lib/api";
import BlogDetailPageClient from "./BlogDetailPageClient";

type Props = { params: Promise<{ slug: string }> };

function excerptFrom(post: any): string {
  if (post.excerpt) return post.excerpt;
  const text = String(post.content ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > 155 ? `${text.slice(0, 152)}...` : text || "A message from The Ecclesia Embassy.";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await blog.getPost(slug).catch(() => null);

  if (!post?.title) {
    return buildMetadata({
      title: "Blog Post",
      description: "Thoughts, teachings, and testimonials from The Ecclesia Embassy.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: post.title,
    description: excerptFrom(post),
    path: `/blog/${slug}`,
    ogImage: post.imageUrl,
  });
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await blog.getPost(slug).catch(() => null);

  const jsonLd = post?.title
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: excerptFrom(post),
        image: post.imageUrl ? [post.imageUrl] : undefined,
        datePublished: post.publishedAt || post.createdAt,
        dateModified: post.updatedAt || post.publishedAt || post.createdAt,
        author: {
          "@type": "Organization",
          name: post.authorName || post.author || "The Ecclesia Embassy",
        },
        publisher: { "@type": "Organization", name: "The Ecclesia Embassy" },
        mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
      }
    : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
           
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <Breadcrumbs
        items={[
          { label: "Blog", href: "/blog" },
          { label: post?.title || "Post" },
        ]}
      />
      <BlogDetailPageClient params={params} />
    </>
  );
}
