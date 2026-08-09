import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP second, original as the last resort. Both are far
    // smaller than the source JPEG/PNG at the same perceived quality.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        // Several section pages still open on Unsplash stock. Routing them
        // through the image optimizer means they are served resized and
        // re-encoded rather than as full-size JPEGs.
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // Next only sets long-lived caching on its own hashed `/_next/static`
  // output. Everything in `/public` — our photography, posters and video —
  // was being served `max-age=0`, so returning visitors re-fetched all of it.
  // These files are replaced by hand rather than content-hashed, so this is a
  // month rather than `immutable`: swap a file and it is picked up within 30
  // days, or sooner by renaming it.
  async headers() {
    return [
      {
        source: "/:path*.(mp4|webm|jpg|jpeg|png|webp|avif|svg|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
