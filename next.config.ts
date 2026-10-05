import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // the floating "N" badge covers the mobile buttons while reviewing the site
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  experimental: {
    // dish photos are resized in the browser, this is just headroom
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
