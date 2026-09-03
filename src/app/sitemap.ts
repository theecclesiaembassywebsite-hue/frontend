import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { blog, events } from "@/lib/api";

const STATIC_ROUTES: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about/leadership", changeFrequency: "monthly", priority: 0.6 },
  { path: "/about/experience", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/give", changeFrequency: "monthly", priority: 0.7 },
  { path: "/new-here", changeFrequency: "monthly", priority: 0.8 },
  { path: "/new-here/new-convert", changeFrequency: "monthly", priority: 0.6 },
  { path: "/prayer", changeFrequency: "monthly", priority: 0.6 },
  { path: "/testimonies", changeFrequency: "weekly", priority: 0.6 },
  { path: "/live", changeFrequency: "daily", priority: 0.7 },
  { path: "/grow", changeFrequency: "monthly", priority: 0.7 },
  { path: "/grow/intentionality-class", changeFrequency: "monthly", priority: 0.6 },
  { path: "/community", changeFrequency: "monthly", priority: 0.6 },
  { path: "/community/groups", changeFrequency: "monthly", priority: 0.6 },
  { path: "/cith", changeFrequency: "monthly", priority: 0.7 },
  { path: "/cith/ehub", changeFrequency: "monthly", priority: 0.5 },
  { path: "/kingdom-expressions", changeFrequency: "monthly", priority: 0.6 },
  { path: "/kingdom-expressions/kip", changeFrequency: "monthly", priority: 0.5 },
  { path: "/kingdom-expressions/squads", changeFrequency: "monthly", priority: 0.5 },
  { path: "/training", changeFrequency: "monthly", priority: 0.7 },
  { path: "/training/eis", changeFrequency: "monthly", priority: 0.6 },
  { path: "/training/kisolam", changeFrequency: "monthly", priority: 0.6 },
  { path: "/training/tema", changeFrequency: "monthly", priority: 0.6 },
  { path: "/resources", changeFrequency: "weekly", priority: 0.7 },
  { path: "/resources/audio", changeFrequency: "weekly", priority: 0.6 },
  { path: "/resources/video", changeFrequency: "weekly", priority: 0.6 },
  { path: "/resources/music", changeFrequency: "weekly", priority: 0.6 },
  { path: "/resources/library", changeFrequency: "weekly", priority: 0.6 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/events", changeFrequency: "weekly", priority: 0.7 },
  { path: "/events/feast-of-tabernacles", changeFrequency: "monthly", priority: 0.6 },
  { path: "/events/gilgal", changeFrequency: "monthly", priority: 0.6 },
  { path: "/accessibility", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy/delete-account", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Backend-dependent entries degrade to "just the static routes" rather
  // than failing the whole sitemap (and the build, since this runs at build
  // time) when the API is unreachable.
  const [blogEntries, eventEntries] = await Promise.all([
    blog
      .getPosts(100, 0)
      .then((posts: any[]) =>
        posts.map((post) => ({
          url: `${SITE_URL}/blog/${post.slug}`,
          lastModified: new Date(post.publishedAt || post.createdAt),
          changeFrequency: "monthly" as const,
          priority: 0.5,
        }))
      )
      .catch(() => []),
    events
      .getEvents(50, 0)
      .then((items: any[]) =>
        items.map((event) => ({
          url: `${SITE_URL}/events/${event.slug ?? event.id}`,
          lastModified: new Date(event.updatedAt),
          changeFrequency: "weekly" as const,
          priority: 0.5,
        }))
      )
      .catch(() => []),
  ]);

  return [...staticEntries, ...blogEntries, ...eventEntries];
}
