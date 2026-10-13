import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // the floating "N" badge covers the mobile buttons while reviewing the site
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      // dish photos uploaded before the switch to Supabase Storage are still on Cloudinary
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
  async headers() {
    return [
      {
        // the staff app's service worker controls the admin path without a trailing slash
        source: "/gestore-prometeo-2026/sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/gestore-prometeo-2026" },
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
      {
        source: "/gestore-prometeo-2026/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  experimental: {
    // dish photos are resized in the browser, this is just headroom
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
